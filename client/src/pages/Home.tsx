import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Listing } from "../types";
import AuctionCard from "../components/AuctionCard";

export default function Home() {
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ listings: Listing[] }>("/listings?status=active&sort=ending_soon")
      .then((res) => setFeatured(res.listings.slice(0, 8)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
            Live auctions, real deals
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-bold text-white sm:text-5xl">
            Bid on exceptional cars and homes
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Gavel &amp; Key connects buyers and sellers through transparent, time-bound auctions.
            Find your next vehicle or dream home — or list your own.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/listings?category=car"
              className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
            >
              Browse Cars
            </Link>
            <Link
              to="/listings?category=house"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Browse Houses
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Ending soon</h2>
            <p className="text-slate-500">Don't miss these auctions before the gavel drops.</p>
          </div>
          <Link to="/listings" className="text-sm font-semibold text-amber-600 hover:text-amber-700">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="text-slate-500">No active auctions right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((listing) => (
              <AuctionCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              title: "Verified Listings",
              desc: "Every listing includes detailed specs, photos, and seller information.",
              icon: "✅",
            },
            {
              title: "Live Bidding",
              desc: "Real-time countdowns and instant outbid tracking keep you in control.",
              icon: "⏱️",
            },
            {
              title: "Sell With Confidence",
              desc: "List your car or home in minutes and reach serious buyers fast.",
              icon: "🏷️",
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
