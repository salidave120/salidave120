# Gavel & Key — Car & House Auctions

A full-stack auction website where users can list cars and houses for auction and place time-bound bids.

## Stack

- **Backend:** Node.js, Express, SQLite (`better-sqlite3`), JWT auth, bcrypt
- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4, React Router

## Features

- Browse and search auctions, filterable by category (cars/houses), status, and price, with sorting
- Detailed listing pages with photo gallery, category-specific specs (make/model/mileage for cars; beds/baths/sqft for houses), live countdown timer, and bid history
- Place bids with server-side validation (minimum increment, active-auction check, can't bid on your own listing)
- User accounts (register/login) with JWT-based auth
- Create listings for cars or houses with category-specific fields, starting price, bid increment, optional reserve price, and auction end time
- Upload photos directly from your device (JPEG/PNG/WEBP/GIF, up to 8MB each, 8 per listing) — no external image hosting required
- Personal dashboard: manage your listings (cancel unbid listings) and track auctions you've bid on (winning/outbid/won)
- Auctions automatically close once their end time passes

## Getting started

```bash
# from the repo root
npm run install:all   # installs server + client dependencies
npm run seed           # seeds the SQLite database with demo users & listings
npm run dev             # runs API (http://localhost:4000) and web app (http://localhost:5173) together
```

Then open http://localhost:5173.

### Demo accounts

Seeded users all share the password `password123`:

- `ava@example.com`
- `liam@example.com`
- `sofia@example.com`
- `noah@example.com`

### Running services individually

```bash
# API only
cd server
cp .env.example .env
npm install
npm run seed   # first time only
npm run dev

# Web app only (in another terminal)
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api/*` requests to the Express API on port 4000, so no CORS configuration is needed in development.

## Project structure

```
server/            Express API + SQLite database
  src/
    db.js          Schema + connection
    seed.js         Demo data seeder
    routes/         auth, listings, bids, watchlist, me, uploads
    uploads/         Uploaded listing photos (served at /uploads/*)
    middleware/      JWT auth middleware
client/            React + Vite frontend
  src/
    pages/          Home, Listings, ListingDetail, Login, Register, CreateListing, Dashboard
    components/      Navbar, AuctionCard, CountdownTimer, Footer, ProtectedRoute
    context/         AuthContext
```

## Notes

This is a demo application — payments, KYC/identity verification, and shipping/escrow logistics that a production auction marketplace would need are out of scope.
