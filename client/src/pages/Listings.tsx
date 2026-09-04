import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import type { Category, Listing } from "../types";
import AuctionCard from "../components/AuctionCard";

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get("q") || "");

  const category = (searchParams.get("category") as Category | null) || "";
  const status = searchParams.get("status") || "active";
  const sort = searchParams.get("sort") || "ending_soon";

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    if (searchParams.get("q")) params.set("q", searchParams.get("q")!);
    return params.toString();
  }, [category, status, sort, searchParams]);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ listings: Listing[] }>(`/listings?${queryString}`)
      .then((res) => setListings(res.listings))
      .finally(() => setLoading(false));
  }, [queryString]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q.trim());
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {category === "car" ? "Car Auctions" : category === "house" ? "House Auctions" : "All Auctions"}
          </h1>
          <p className="text-slate-500">{listings.length} results</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, make, location..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        {[
          { label: "All", value: "" },
          { label: "Cars", value: "car" },
          { label: "Houses", value: "house" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParam("category", opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === opt.value
                ? "bg-amber-500 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300"
            }`}
          >
            {opt.label}
          </button>
        ))}

        <span className="mx-2 h-5 w-px bg-slate-200" />

        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-full border-none bg-white px-4 py-1.5 text-sm text-slate-600 ring-1 ring-slate-200 focus:outline-none focus:ring-amber-500"
        >
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="">All statuses</option>
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-full border-none bg-white px-4 py-1.5 text-sm text-slate-600 ring-1 ring-slate-200 focus:outline-none focus:ring-amber-500"
        >
          <option value="ending_soon">Ending soon</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No auctions match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing) => (
            <AuctionCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
