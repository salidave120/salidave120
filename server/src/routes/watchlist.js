import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT listings.*, watchlist.created_at AS watched_at
       FROM watchlist JOIN listings ON listings.id = watchlist.listing_id
       WHERE watchlist.user_id = ? ORDER BY watchlist.created_at DESC`
    )
    .all(req.user.id);
  res.json({ watchlist: rows.map((r) => ({ ...r, images: JSON.parse(r.images || "[]") })) });
});

router.post("/:listingId", requireAuth, (req, res) => {
  const listing = db.prepare("SELECT id FROM listings WHERE id = ?").get(req.params.listingId);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  db.prepare(
    "INSERT OR IGNORE INTO watchlist (user_id, listing_id) VALUES (?, ?)"
  ).run(req.user.id, req.params.listingId);
  res.json({ ok: true });
});

router.delete("/:listingId", requireAuth, (req, res) => {
  db.prepare("DELETE FROM watchlist WHERE user_id = ? AND listing_id = ?").run(
    req.user.id,
    req.params.listingId
  );
  res.json({ ok: true });
});

export default router;
