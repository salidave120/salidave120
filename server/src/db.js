import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "auction.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    category TEXT NOT NULL CHECK (category IN ('car','house')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    images TEXT NOT NULL DEFAULT '[]',
    starting_price REAL NOT NULL,
    bid_increment REAL NOT NULL DEFAULT 100,
    current_price REAL NOT NULL,
    reserve_price REAL,
    starts_at TEXT NOT NULL DEFAULT (datetime('now')),
    ends_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended','cancelled')),
    -- car fields
    make TEXT,
    model TEXT,
    year INTEGER,
    mileage INTEGER,
    fuel_type TEXT,
    transmission TEXT,
    vin TEXT,
    -- house fields
    address TEXT,
    bedrooms INTEGER,
    bathrooms REAL,
    sqft INTEGER,
    lot_size TEXT,
    year_built INTEGER,
    property_type TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL REFERENCES listings(id),
    bidder_id INTEGER NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS watchlist (
    user_id INTEGER NOT NULL REFERENCES users(id),
    listing_id INTEGER NOT NULL REFERENCES listings(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, listing_id)
  );

  CREATE INDEX IF NOT EXISTS idx_bids_listing ON bids(listing_id);
  CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
  CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
`);

export function closeExpiredAuctions() {
  db.prepare(
    `UPDATE listings SET status = 'ended' WHERE status = 'active' AND ends_at <= datetime('now')`
  ).run();
}
