import { Router } from "express";
import { db, closeExpiredAuctions } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/:listingId/bids", requireAuth, (req, res) => {
  closeExpiredAuctions();
  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(req.params.listingId);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.status !== "active") {
    return res.status(400).json({ error: "This auction is not active" });
  }
  if (listing.seller_id === req.user.id) {
    return res.status(400).json({ error: "You cannot bid on your own listing" });
  }
  if (new Date(listing.ends_at).getTime() <= Date.now()) {
    db.prepare("UPDATE listings SET status = 'ended' WHERE id = ?").run(listing.id);
    return res.status(400).json({ error: "This auction has ended" });
  }

  const amount = Number(req.body?.amount);
  const minBid = listing.current_price + listing.bid_increment;
  const hasBids = db.prepare("SELECT COUNT(*) AS c FROM bids WHERE listing_id = ?").get(listing.id).c > 0;
  const minRequired = hasBids ? minBid : listing.starting_price;

  if (!amount || amount < minRequired) {
    return res.status(400).json({
      error: `Bid must be at least $${minRequired.toLocaleString()}`,
      minRequired,
    });
  }

  const insertBid = db.transaction(() => {
    db.prepare("INSERT INTO bids (listing_id, bidder_id, amount) VALUES (?, ?, ?)").run(
      listing.id,
      req.user.id,
      amount
    );
    db.prepare("UPDATE listings SET current_price = ? WHERE id = ?").run(amount, listing.id);
  });
  insertBid();

  const updated = db.prepare("SELECT * FROM listings WHERE id = ?").get(listing.id);
  res.status(201).json({
    listing: { ...updated, images: JSON.parse(updated.images || "[]") },
    minRequired: amount + listing.bid_increment,
  });
});

export default router;
