import { Router } from "express";
import { db, closeExpiredAuctions } from "../db.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

const CAR_FIELDS = ["make", "model", "year", "mileage", "fuel_type", "transmission", "vin"];
const HOUSE_FIELDS = [
  "address",
  "bedrooms",
  "bathrooms",
  "sqft",
  "lot_size",
  "year_built",
  "property_type",
];

function serializeListing(row) {
  return {
    ...row,
    images: JSON.parse(row.images || "[]"),
  };
}

router.get("/", (req, res) => {
  closeExpiredAuctions();
  const { category, status, q, minPrice, maxPrice, sort } = req.query;

  const clauses = [];
  const params = {};

  if (category && ["car", "house"].includes(category)) {
    clauses.push("category = @category");
    params.category = category;
  }
  if (status && ["active", "ended", "cancelled"].includes(status)) {
    clauses.push("status = @status");
    params.status = status;
  }
  if (q) {
    clauses.push("(title LIKE @q OR description LIKE @q OR location LIKE @q)");
    params.q = `%${q}%`;
  }
  if (minPrice) {
    clauses.push("current_price >= @minPrice");
    params.minPrice = Number(minPrice);
  }
  if (maxPrice) {
    clauses.push("current_price <= @maxPrice");
    params.maxPrice = Number(maxPrice);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  let orderBy = "listings.ends_at ASC";
  if (sort === "newest") orderBy = "listings.created_at DESC";
  if (sort === "price_asc") orderBy = "listings.current_price ASC";
  if (sort === "price_desc") orderBy = "listings.current_price DESC";
  if (sort === "ending_soon") orderBy = "listings.ends_at ASC";

  const rows = db
    .prepare(
      `SELECT listings.*, users.name AS seller_name,
        (SELECT COUNT(*) FROM bids WHERE bids.listing_id = listings.id) AS bid_count
       FROM listings
       JOIN users ON users.id = listings.seller_id
       ${where}
       ORDER BY ${orderBy}`
    )
    .all(params);

  res.json({ listings: rows.map(serializeListing) });
});

router.get("/:id", (req, res) => {
  closeExpiredAuctions();
  const row = db
    .prepare(
      `SELECT listings.*, users.name AS seller_name
       FROM listings JOIN users ON users.id = listings.seller_id
       WHERE listings.id = ?`
    )
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: "Listing not found" });

  const bids = db
    .prepare(
      `SELECT bids.id, bids.amount, bids.created_at, users.name AS bidder_name
       FROM bids JOIN users ON users.id = bids.bidder_id
       WHERE listing_id = ? ORDER BY bids.amount DESC, bids.created_at DESC`
    )
    .all(req.params.id);

  res.json({ listing: serializeListing(row), bids });
});

router.post("/", requireAuth, (req, res) => {
  const body = req.body || {};
  const { category, title, description, location, images, startingPrice, bidIncrement, reservePrice, endsAt } =
    body;

  if (!category || !["car", "house"].includes(category)) {
    return res.status(400).json({ error: "category must be 'car' or 'house'" });
  }
  if (!title || !description || !location || !startingPrice || !endsAt) {
    return res
      .status(400)
      .json({ error: "title, description, location, startingPrice and endsAt are required" });
  }
  const endsAtDate = new Date(endsAt);
  if (Number.isNaN(endsAtDate.getTime()) || endsAtDate.getTime() <= Date.now()) {
    return res.status(400).json({ error: "endsAt must be a valid future date" });
  }
  if (Number(startingPrice) <= 0) {
    return res.status(400).json({ error: "startingPrice must be positive" });
  }

  const categoryFields = category === "car" ? CAR_FIELDS : HOUSE_FIELDS;
  const columns = ["seller_id", "category", "title", "description", "location", "images", "starting_price", "bid_increment", "current_price", "reserve_price", "ends_at"];
  const values = {
    seller_id: req.user.id,
    category,
    title: String(title).trim(),
    description: String(description).trim(),
    location: String(location).trim(),
    images: JSON.stringify(Array.isArray(images) ? images.slice(0, 8) : []),
    starting_price: Number(startingPrice),
    bid_increment: Number(bidIncrement) > 0 ? Number(bidIncrement) : 100,
    current_price: Number(startingPrice),
    reserve_price: reservePrice ? Number(reservePrice) : null,
    ends_at: endsAtDate.toISOString(),
  };

  for (const field of categoryFields) {
    if (body[toCamel(field)] !== undefined) {
      columns.push(field);
      values[field] = body[toCamel(field)];
    }
  }

  const placeholders = columns.map((c) => `@${c}`).join(", ");
  const info = db
    .prepare(`INSERT INTO listings (${columns.join(", ")}) VALUES (${placeholders})`)
    .run(values);

  const created = db.prepare("SELECT * FROM listings WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ listing: serializeListing(created) });
});

router.delete("/:id", requireAuth, (req, res) => {
  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.seller_id !== req.user.id) {
    return res.status(403).json({ error: "You can only cancel your own listings" });
  }
  const bidCount = db.prepare("SELECT COUNT(*) AS c FROM bids WHERE listing_id = ?").get(req.params.id).c;
  if (bidCount > 0) {
    return res.status(400).json({ error: "Cannot cancel a listing that already has bids" });
  }
  db.prepare("UPDATE listings SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

function toCamel(snake) {
  return snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export default router;
