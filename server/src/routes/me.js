import { Router } from "express";
import { db, closeExpiredAuctions } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/bids", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT bids.id, bids.amount, bids.created_at, listings.id AS listing_id, listings.title,
              listings.status, listings.current_price, listings.images, listings.category, listings.ends_at
       FROM bids JOIN listings ON listings.id = bids.listing_id
       WHERE bids.bidder_id = ?
       ORDER BY bids.created_at DESC`
    )
    .all(req.user.id);
  res.json({ bids: rows.map((r) => ({ ...r, images: JSON.parse(r.images || "[]") })) });
});

router.get("/listings", requireAuth, (req, res) => {
  closeExpiredAuctions();
  const rows = db
    .prepare(
      `SELECT listings.*, (SELECT COUNT(*) FROM bids WHERE bids.listing_id = listings.id) AS bid_count
       FROM listings WHERE seller_id = ? ORDER BY created_at DESC`
    )
    .all(req.user.id);
  res.json({ listings: rows.map((r) => ({ ...r, images: JSON.parse(r.images || "[]") })) });
});

export default router;
