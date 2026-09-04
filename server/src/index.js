import "dotenv/config";
import express from "express";
import cors from "cors";
import "./db.js";
import authRoutes from "./routes/auth.js";
import listingsRoutes from "./routes/listings.js";
import bidsRoutes from "./routes/bids.js";
import watchlistRoutes from "./routes/watchlist.js";
import meRoutes from "./routes/me.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/listings", bidsRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/me", meRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Auction API listening on http://localhost:${PORT}`);
});
