import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api";
import type { Listing, MyBid } from "../types";
import { formatCurrency } from "../lib/format";
import CountdownTimer from "../components/CountdownTimer";

export default function Dashboard() {
  const [tab, setTab] = useState<"listings" | "bids">("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [bids, setBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");

  function loadAll() {
    setLoading(true);
    Promise.all([
      api.get<{ listings: Listing[] }>("/me/listings"),
      api.get<{ bids: MyBid[] }>("/me/bids"),
    ])
      .then(([l, b]) => {
        setListings(l.listings);
        setBids(b.bids);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function cancelListing(id: number) {
    setActionError("");
    try {
      await api.del(`/listings/${id}`);
      loadAll();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to cancel listing");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Your Dashboard</h1>
      <p className="mt-1 text-slate-500">Manage your listings and track the auctions you're bidding on.</p>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {[
          { key: "listings" as const, label: `My Listings (${listings.length})` },
          { key: "bids" as const, label: `My Bids (${bids.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.key ? "border-amber-500 text-amber-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
        <Link to="/listings/new" className="ml-auto self-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          + New Listing
        </Link>
      </div>

      {actionError && <p className="mt-4 text-sm text-rose-600">{actionError}</p>}

      <div className="mt-6">
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : tab === "listings" ? (
          listings.length === 0 ? (
            <EmptyState message="You haven't created any listings yet." cta="Create your first listing" to="/listings/new" />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Listing</th>
                    <th className="px-4 py-3">Current Price</th>
                    <th className="px-4 py-3">Bids</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <tr key={l.id}>
                      <td className="px-4 py-3">
                        <Link to={`/listings/${l.id}`} className="font-medium text-slate-800 hover:text-amber-600">
                          {l.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{formatCurrency(l.current_price)}</td>
                      <td className="px-4 py-3">{l.bid_count ?? 0}</td>
                      <td className="px-4 py-3">
                        {l.status === "active" ? (
                          <CountdownTimer endsAt={l.ends_at} status={l.status} compact />
                        ) : (
                          <span className="capitalize text-slate-500">{l.status}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {l.status === "active" && (l.bid_count ?? 0) === 0 && (
                          <button
                            onClick={() => cancelListing(l.id)}
                            className="text-xs font-medium text-rose-600 hover:text-rose-700"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : bids.length === 0 ? (
          <EmptyState message="You haven't placed any bids yet." cta="Browse auctions" to="/listings" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Your Bid</th>
                  <th className="px-4 py-3">Current Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bids.map((b) => {
                  const winning = b.amount >= b.current_price;
                  return (
                    <tr key={b.id}>
                      <td className="px-4 py-3">
                        <Link to={`/listings/${b.listing_id}`} className="font-medium text-slate-800 hover:text-amber-600">
                          {b.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{formatCurrency(b.amount)}</td>
                      <td className="px-4 py-3">{formatCurrency(b.current_price)}</td>
                      <td className="px-4 py-3">
                        {b.status === "active" ? (
                          <span className={winning ? "font-medium text-emerald-600" : "font-medium text-rose-600"}>
                            {winning ? "Winning" : "Outbid"}
                          </span>
                        ) : (
                          <span className={winning ? "font-medium text-emerald-600" : "text-slate-500"}>
                            {winning ? "Won" : "Ended"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, cta, to }: { message: string; cta: string; to: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
      <p className="text-slate-500">{message}</p>
      <Link to={to} className="mt-3 inline-block font-semibold text-amber-600 hover:text-amber-700">
        {cta} →
      </Link>
    </div>
  );
}
