export type Category = "car" | "house";
export type ListingStatus = "active" | "ended" | "cancelled";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Listing {
  id: number;
  seller_id: number;
  seller_name?: string;
  category: Category;
  title: string;
  description: string;
  location: string;
  images: string[];
  starting_price: number;
  bid_increment: number;
  current_price: number;
  reserve_price: number | null;
  starts_at: string;
  ends_at: string;
  status: ListingStatus;
  bid_count?: number;
  // car
  make?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  fuel_type?: string | null;
  transmission?: string | null;
  vin?: string | null;
  // house
  address?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  lot_size?: string | null;
  year_built?: number | null;
  property_type?: string | null;
}

export interface Bid {
  id: number;
  amount: number;
  created_at: string;
  bidder_name?: string;
}

export interface MyBid {
  id: number;
  amount: number;
  created_at: string;
  listing_id: number;
  title: string;
  status: ListingStatus;
  current_price: number;
  images: string[];
  category: Category;
  ends_at: string;
}
