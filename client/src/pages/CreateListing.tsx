import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";
import type { Category, Listing } from "../types";

const CAR_FUEL_TYPES = ["Gasoline", "Diesel", "Electric", "Hybrid", "Other"];
const CAR_TRANSMISSIONS = ["Automatic", "Manual", "PDK Automatic", "CVT", "Other"];
const HOUSE_PROPERTY_TYPES = ["Single Family", "Condo", "Townhouse", "Multi-Family", "Land", "Other"];

function toLocalDateTimeInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function CreateListing() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>("car");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const defaultEnds = toLocalDateTimeInput(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    imagesText: "",
    startingPrice: "",
    bidIncrement: "100",
    reservePrice: "",
    endsAt: defaultEnds,
    // car
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "Gasoline",
    transmission: "Automatic",
    vin: "",
    // house
    address: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    lotSize: "",
    yearBuilt: "",
    propertyType: "Single Family",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.title || !form.description || !form.location || !form.startingPrice || !form.endsAt) {
      setError("Please fill in all required fields.");
      return;
    }

    const images = form.imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Record<string, unknown> = {
      category,
      title: form.title,
      description: form.description,
      location: form.location,
      images,
      startingPrice: Number(form.startingPrice),
      bidIncrement: Number(form.bidIncrement) || 100,
      reservePrice: form.reservePrice ? Number(form.reservePrice) : undefined,
      endsAt: new Date(form.endsAt).toISOString(),
    };

    if (category === "car") {
      Object.assign(payload, {
        make: form.make || undefined,
        model: form.model || undefined,
        year: form.year ? Number(form.year) : undefined,
        mileage: form.mileage ? Number(form.mileage) : undefined,
        fuelType: form.fuelType || undefined,
        transmission: form.transmission || undefined,
        vin: form.vin || undefined,
      });
    } else {
      Object.assign(payload, {
        address: form.address || undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        sqft: form.sqft ? Number(form.sqft) : undefined,
        lotSize: form.lotSize || undefined,
        yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
        propertyType: form.propertyType || undefined,
      });
    }

    setSubmitting(true);
    try {
      const res = await api.post<{ listing: Listing }>("/listings", payload);
      navigate(`/listings/${res.listing.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Create a listing</h1>
      <p className="mt-1 text-slate-500">List your car or home for auction in a few minutes.</p>

      <div className="mt-6 flex gap-2">
        {(["car", "house"] as Category[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              category === c ? "bg-amber-500 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {c === "car" ? "🚗 Car" : "🏠 House"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Basic details</h2>
          <div>
            <label htmlFor="title" className={labelClass}>Title *</label>
            <input
              id="title"
              className={inputClass}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder={category === "car" ? "2021 Porsche 911 Carrera S" : "Modern Hillside Retreat"}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>Description *</label>
            <textarea
              id="description"
              className={inputClass}
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="location" className={labelClass}>Location *</label>
            <input
              id="location"
              className={inputClass}
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Austin, TX"
              required
            />
          </div>
          <div>
            <label htmlFor="imagesText" className={labelClass}>Image URLs (one per line)</label>
            <textarea
              id="imagesText"
              className={inputClass}
              rows={3}
              value={form.imagesText}
              onChange={(e) => update("imagesText", e.target.value)}
              placeholder="https://example.com/photo1.jpg"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Auction settings</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startingPrice" className={labelClass}>Starting price ($) *</label>
              <input
                id="startingPrice"
                type="number"
                min={1}
                className={inputClass}
                value={form.startingPrice}
                onChange={(e) => update("startingPrice", e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="bidIncrement" className={labelClass}>Bid increment ($)</label>
              <input
                id="bidIncrement"
                type="number"
                min={1}
                className={inputClass}
                value={form.bidIncrement}
                onChange={(e) => update("bidIncrement", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reservePrice" className={labelClass}>Reserve price ($, optional)</label>
              <input
                id="reservePrice"
                type="number"
                min={0}
                className={inputClass}
                value={form.reservePrice}
                onChange={(e) => update("reservePrice", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endsAt" className={labelClass}>Auction ends *</label>
              <input
                id="endsAt"
                type="datetime-local"
                className={inputClass}
                value={form.endsAt}
                onChange={(e) => update("endsAt", e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {category === "car" ? (
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Vehicle details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="make" className={labelClass}>Make</label>
                <input id="make" className={inputClass} value={form.make} onChange={(e) => update("make", e.target.value)} />
              </div>
              <div>
                <label htmlFor="model" className={labelClass}>Model</label>
                <input id="model" className={inputClass} value={form.model} onChange={(e) => update("model", e.target.value)} />
              </div>
              <div>
                <label htmlFor="year" className={labelClass}>Year</label>
                <input id="year" type="number" className={inputClass} value={form.year} onChange={(e) => update("year", e.target.value)} />
              </div>
              <div>
                <label htmlFor="mileage" className={labelClass}>Mileage</label>
                <input id="mileage" type="number" className={inputClass} value={form.mileage} onChange={(e) => update("mileage", e.target.value)} />
              </div>
              <div>
                <label htmlFor="fuelType" className={labelClass}>Fuel type</label>
                <select id="fuelType" className={inputClass} value={form.fuelType} onChange={(e) => update("fuelType", e.target.value)}>
                  {CAR_FUEL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="transmission" className={labelClass}>Transmission</label>
                <select id="transmission" className={inputClass} value={form.transmission} onChange={(e) => update("transmission", e.target.value)}>
                  {CAR_TRANSMISSIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="vin" className={labelClass}>VIN</label>
                <input id="vin" className={inputClass} value={form.vin} onChange={(e) => update("vin", e.target.value)} />
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Property details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className={labelClass}>Address</label>
                <input id="address" className={inputClass} value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
              <div>
                <label htmlFor="bedrooms" className={labelClass}>Bedrooms</label>
                <input id="bedrooms" type="number" className={inputClass} value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
              </div>
              <div>
                <label htmlFor="bathrooms" className={labelClass}>Bathrooms</label>
                <input id="bathrooms" type="number" step="0.5" className={inputClass} value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
              </div>
              <div>
                <label htmlFor="sqft" className={labelClass}>Square feet</label>
                <input id="sqft" type="number" className={inputClass} value={form.sqft} onChange={(e) => update("sqft", e.target.value)} />
              </div>
              <div>
                <label htmlFor="lotSize" className={labelClass}>Lot size</label>
                <input id="lotSize" className={inputClass} value={form.lotSize} onChange={(e) => update("lotSize", e.target.value)} placeholder="0.25 acres" />
              </div>
              <div>
                <label htmlFor="yearBuilt" className={labelClass}>Year built</label>
                <input id="yearBuilt" type="number" className={inputClass} value={form.yearBuilt} onChange={(e) => update("yearBuilt", e.target.value)} />
              </div>
              <div>
                <label htmlFor="propertyType" className={labelClass}>Property type</label>
                <select id="propertyType" className={inputClass} value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
                  {HOUSE_PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
