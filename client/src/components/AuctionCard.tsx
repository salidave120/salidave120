import { Link } from "react-router-dom";
import type { Listing } from "../types";
import { formatCurrency } from "../lib/format";
import { PLACEHOLDER_IMAGE, handleImageError } from "../lib/image";
import CountdownTimer from "./CountdownTimer";

export default function AuctionCard({ listing }: { listing: Listing }) {
  const image = listing.images?.[0] || PLACEHOLDER_IMAGE;
  const subtitle =
    listing.category === "car"
      ? [listing.year, listing.make, listing.model].filter(Boolean).join(" ")
      : [listing.bedrooms && `${listing.bedrooms} bd`, listing.bathrooms && `${listing.bathrooms} ba`, listing.sqft && `${listing.sqft.toLocaleString()} sqft`]
          .filter(Boolean)
          .join(" · ");

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={listing.title}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow">
          {listing.category === "car" ? "Car" : "House"}
        </span>
        {listing.status !== "active" && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Ended
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-900">{listing.title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        <p className="text-sm text-slate-400">{listing.location}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Current bid</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(listing.current_price)}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {listing.status === "active" ? "Time left" : "Status"}
            </p>
            <CountdownTimer endsAt={listing.ends_at} status={listing.status} compact />
          </div>
        </div>
      </div>
    </Link>
  );
}
