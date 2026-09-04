import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../api";
import type { Bid, Listing } from "../types";
import { formatCurrency } from "../lib/format";
import CountdownTimer from "../components/CountdownTimer";
import { useAuth } from "../context/AuthContext";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    return api
      .get<{ listing: Listing; bids: Bid[] }>(`/listings/${id}`)
      .then((res) => {
        setListing(res.listing);
        setBids(res.bids);
      });
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const minRequired = listing
    ? bids.length > 0
      ? listing.current_price + listing.bid_increment
      : listing.starting_price
    : 0;

  async function handleBid(e: React.FormEvent) {
    e.preventDefault();
    setBidError("");
    setBidSuccess("");
    if (!user) {
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    const amount = Number(bidAmount);
    if (!amount || amount < minRequired) {
      setBidError(`Bid must be at least ${formatCurrency(minRequired)}`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/listings/${id}/bids`, { amount });
      setBidSuccess("Your bid was placed successfully!");
      setBidAmount("");
      await load();
    } catch (err) {
      setBidError(err instanceof ApiError ? err.message : "Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">Loading auction...</div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">
        Listing not found. <Link to="/listings" className="text-amber-600">Back to listings</Link>
      </div>
    );
  }

  const images = listing.images.length > 0 ? listing.images : [
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200",
  ];

  const isOwner = user?.id === listing.seller_id;
  const isActive = listing.status === "active";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/listings" className="hover:text-slate-700">Auctions</Link>
        <span>/</span>
        <Link to={`/listings?category=${listing.category}`} className="hover:text-slate-700">
          {listing.category === "car" ? "Cars" : "Houses"}
        </Link>
        <span>/</span>
        <span className="text-slate-700">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <img src={images[activeImage]} alt={listing.title} className="aspect-video w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={img + idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-24 overflow-hidden rounded-lg border-2 ${
                    idx === activeImage ? "border-amber-500" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {listing.category === "car" ? "Car" : "House"}
              </span>
              {!isActive && (
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                  {listing.status}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">{listing.title}</h1>
            <p className="mt-1 text-slate-500">{listing.location} · Listed by {listing.seller_name}</p>

            <p className="mt-6 whitespace-pre-line text-slate-700">{listing.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
              {listing.category === "car" ? (
                <>
                  <Spec label="Make" value={listing.make} />
                  <Spec label="Model" value={listing.model} />
                  <Spec label="Year" value={listing.year} />
                  <Spec label="Mileage" value={listing.mileage ? `${listing.mileage.toLocaleString()} mi` : null} />
                  <Spec label="Fuel Type" value={listing.fuel_type} />
                  <Spec label="Transmission" value={listing.transmission} />
                </>
              ) : (
                <>
                  <Spec label="Address" value={listing.address} />
                  <Spec label="Bedrooms" value={listing.bedrooms} />
                  <Spec label="Bathrooms" value={listing.bathrooms} />
                  <Spec label="Square Feet" value={listing.sqft?.toLocaleString()} />
                  <Spec label="Lot Size" value={listing.lot_size} />
                  <Spec label="Year Built" value={listing.year_built} />
                  <Spec label="Property Type" value={listing.property_type} />
                </>
              )}
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Bid History ({bids.length})</h2>
              {bids.length === 0 ? (
                <p className="text-slate-500">No bids yet. Be the first!</p>
              ) : (
                <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                  {bids.map((bid) => (
                    <li key={bid.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="font-medium text-slate-700">{bid.bidder_name}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(bid.amount)}</span>
                      <span className="text-slate-400">{new Date(bid.created_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {isActive ? "Current bid" : "Final price"}
            </p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(listing.current_price)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {bids.length} bid{bids.length === 1 ? "" : "s"} · Starting price {formatCurrency(listing.starting_price)}
            </p>

            <div className="my-5 border-t border-slate-100" />

            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              {isActive ? "Time remaining" : "Status"}
            </p>
            <CountdownTimer endsAt={listing.ends_at} status={listing.status} />

            <div className="my-5 border-t border-slate-100" />

            {isOwner ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                This is your listing. You can't bid on your own auction.
              </p>
            ) : isActive ? (
              <form onSubmit={handleBid} className="space-y-3">
                <label htmlFor="bidAmount" className="block text-sm font-medium text-slate-700">
                  Your bid (min {formatCurrency(minRequired)})
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-slate-500">$</span>
                  <input
                    id="bidAmount"
                    type="number"
                    step="1"
                    min={minRequired}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={String(minRequired)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                {bidError && <p className="text-sm text-rose-600">{bidError}</p>}
                {bidSuccess && <p className="text-sm text-emerald-600">{bidSuccess}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {submitting ? "Placing bid..." : user ? "Place Bid" : "Log in to Bid"}
                </button>
              </form>
            ) : (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                This auction has ended.
                {listing.reserve_price && listing.current_price < listing.reserve_price
                  ? " Reserve price was not met."
                  : ""}
              </p>
            )}

            {listing.reserve_price && (
              <p className="mt-3 text-xs text-slate-400">
                {listing.current_price >= listing.reserve_price
                  ? "Reserve price met"
                  : "Reserve price not yet met"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
