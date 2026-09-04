import bcrypt from "bcryptjs";
import { db } from "./db.js";

function hoursFromNow(h) {
  return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
}

function unsplash(id) {
  return `https://images.unsplash.com/photo-${id}?w=1200&auto=format&fit=crop`;
}

// Reusable interior/detail shots so every listing shows more than one "place",
// even when we don't have a second angle specific to that exact property or car.
const HOUSE_LIVING_ROOM = unsplash("1493809842364-78817add7ffb");
const HOUSE_KITCHEN = unsplash("1556911220-e15b29be8c8f");
const HOUSE_BEDROOM = unsplash("1522708323590-d24dbb6b0267");
const HOUSE_BATHROOM = unsplash("1584622650111-993a426fbf0a");
const HOUSE_POOL_BACKYARD = unsplash("1600585154340-be6161a56a0c");

const CAR_INTERIOR = unsplash("1502877338535-766e1452684a");
const CAR_ON_ROAD = unsplash("1494976388531-d1058494cdd8");

async function seed() {
  console.log("Seeding database...");

  db.exec("DELETE FROM watchlist; DELETE FROM bids; DELETE FROM listings; DELETE FROM users;");

  const passwordHash = await bcrypt.hash("password123", 10);
  const users = ["Ava Martinez", "Liam Chen", "Sofia Rossi", "Noah Patel"].map((name) => {
    const email = `${name.split(" ")[0].toLowerCase()}@example.com`;
    const info = db
      .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
      .run(name, email, passwordHash);
    return { id: info.lastInsertRowid, name, email };
  });

  const insertListing = db.prepare(`
    INSERT INTO listings (
      seller_id, category, title, description, location, images,
      starting_price, bid_increment, current_price, reserve_price, ends_at,
      make, model, year, mileage, fuel_type, transmission, vin,
      address, bedrooms, bathrooms, sqft, lot_size, year_built, property_type
    ) VALUES (
      @seller_id, @category, @title, @description, @location, @images,
      @starting_price, @bid_increment, @current_price, @reserve_price, @ends_at,
      @make, @model, @year, @mileage, @fuel_type, @transmission, @vin,
      @address, @bedrooms, @bathrooms, @sqft, @lot_size, @year_built, @property_type
    )
  `);

  const cars = [
    {
      title: "2021 Porsche 911 Carrera S",
      description:
        "Immaculate one-owner 911 Carrera S finished in GT Silver Metallic. Full service history, sport chrono package, and ceramic brakes. A true driver's car.",
      location: "Austin, TX",
      images: [
        unsplash("1503376780353-7e6692767b70"),
        unsplash("1503736334956-4c8f8e92946d"),
        CAR_INTERIOR,
      ],
      starting_price: 68000,
      bid_increment: 1000,
      reserve_price: 78000,
      ends_at: hoursFromNow(30),
      make: "Porsche",
      model: "911 Carrera S",
      year: 2021,
      mileage: 8400,
      fuel_type: "Gasoline",
      transmission: "PDK Automatic",
      vin: "WP0AB2A99MS123456",
    },
    {
      title: "2019 Ford F-150 Raptor",
      description:
        "Beadlock-capable wheels, FOX Live Valve shocks, and a 3.5L EcoBoost V6 producing 450hp. Garage kept, never off-roaded hard.",
      location: "Denver, CO",
      images: [
        unsplash("1583267746897-2cf415887172"),
        CAR_INTERIOR,
        CAR_ON_ROAD,
      ],
      starting_price: 39000,
      bid_increment: 500,
      reserve_price: null,
      ends_at: hoursFromNow(18),
      make: "Ford",
      model: "F-150 Raptor",
      year: 2019,
      mileage: 32100,
      fuel_type: "Gasoline",
      transmission: "10-Speed Automatic",
      vin: "1FTFW1RG0KFA12345",
    },
    {
      title: "2020 Tesla Model 3 Performance",
      description:
        "Dual motor AWD, 0-60 in 3.1s, full self-driving capability included. Recent tire replacement and new brake pads.",
      location: "San Jose, CA",
      images: [
        unsplash("1560958089-b8a1929cea89"),
        CAR_INTERIOR,
        CAR_ON_ROAD,
      ],
      starting_price: 28000,
      bid_increment: 500,
      reserve_price: 32000,
      ends_at: hoursFromNow(52),
      make: "Tesla",
      model: "Model 3 Performance",
      year: 2020,
      mileage: 41250,
      fuel_type: "Electric",
      transmission: "Single-Speed",
      vin: "5YJ3E1EB0LF123456",
    },
    {
      title: "1969 Chevrolet Camaro SS",
      description:
        "Numbers-matching 396 big block, frame-off restoration completed in 2022. Turns heads everywhere it goes.",
      location: "Charlotte, NC",
      images: [
        unsplash("1552519507-da3b142c6e3d"),
        CAR_INTERIOR,
        CAR_ON_ROAD,
      ],
      starting_price: 45000,
      bid_increment: 1000,
      reserve_price: 55000,
      ends_at: hoursFromNow(70),
      make: "Chevrolet",
      model: "Camaro SS",
      year: 1969,
      mileage: 78500,
      fuel_type: "Gasoline",
      transmission: "4-Speed Manual",
      vin: "124379N123456",
    },
  ];

  const houses = [
    {
      title: "Modern Hillside Retreat with City Views",
      description:
        "Stunning 4-bed architectural home with floor-to-ceiling glass, a chef's kitchen, and an infinity pool overlooking the valley.",
      location: "Austin, TX",
      images: [
        unsplash("1600596542815-ffad4c1539a9"),
        unsplash("1600607687939-ce8a6c25118c"),
        HOUSE_POOL_BACKYARD,
        HOUSE_KITCHEN,
        HOUSE_BEDROOM,
      ],
      starting_price: 850000,
      bid_increment: 5000,
      reserve_price: 950000,
      ends_at: hoursFromNow(96),
      address: "1420 Skyline Dr, Austin, TX",
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 3600,
      lot_size: "0.45 acres",
      year_built: 2018,
      property_type: "Single Family",
    },
    {
      title: "Downtown Loft with Rooftop Terrace",
      description:
        "Industrial-chic 2-bed loft in a converted warehouse. Exposed brick, 14ft ceilings, and a private rooftop deck with skyline views.",
      location: "Chicago, IL",
      images: [
        unsplash("1502672260266-1c1ef2d93688"),
        HOUSE_KITCHEN,
        HOUSE_BEDROOM,
        HOUSE_BATHROOM,
      ],
      starting_price: 420000,
      bid_increment: 2500,
      reserve_price: null,
      ends_at: hoursFromNow(24),
      address: "88 W Randolph St #12, Chicago, IL",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1650,
      lot_size: "N/A",
      year_built: 1925,
      property_type: "Condo",
    },
    {
      title: "Coastal Cottage Steps from the Beach",
      description:
        "Charming 3-bed cottage two blocks from the sand. Fully renovated in 2021 with a wraparound porch and outdoor shower.",
      location: "Charleston, SC",
      images: [
        unsplash("1568605114967-8130f3a36994"),
        HOUSE_LIVING_ROOM,
        HOUSE_KITCHEN,
        HOUSE_BEDROOM,
      ],
      starting_price: 560000,
      bid_increment: 5000,
      reserve_price: 620000,
      ends_at: hoursFromNow(60),
      address: "212 Ocean Ave, Charleston, SC",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1980,
      lot_size: "0.2 acres",
      year_built: 1948,
      property_type: "Single Family",
    },
    {
      title: "Mountain Cabin Estate on 5 Acres",
      description:
        "Log cabin retreat with vaulted great room, stone fireplace, and detached guest house. Bordered by national forest.",
      location: "Aspen, CO",
      images: [
        unsplash("1449844908441-8829872d2607"),
        HOUSE_LIVING_ROOM,
        HOUSE_KITCHEN,
        HOUSE_BATHROOM,
      ],
      starting_price: 1200000,
      bid_increment: 10000,
      reserve_price: 1400000,
      ends_at: hoursFromNow(120),
      address: "7 Timberline Rd, Aspen, CO",
      bedrooms: 5,
      bathrooms: 4,
      sqft: 4200,
      lot_size: "5 acres",
      year_built: 2005,
      property_type: "Single Family",
    },
  ];

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  for (const car of cars) {
    const seller = rand(users);
    insertListing.run({
      seller_id: seller.id,
      category: "car",
      title: car.title,
      description: car.description,
      location: car.location,
      images: JSON.stringify(car.images),
      starting_price: car.starting_price,
      bid_increment: car.bid_increment,
      current_price: car.starting_price,
      reserve_price: car.reserve_price,
      ends_at: car.ends_at,
      make: car.make,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      vin: car.vin,
      address: null,
      bedrooms: null,
      bathrooms: null,
      sqft: null,
      lot_size: null,
      year_built: null,
      property_type: null,
    });
  }

  for (const house of houses) {
    const seller = rand(users);
    insertListing.run({
      seller_id: seller.id,
      category: "house",
      title: house.title,
      description: house.description,
      location: house.location,
      images: JSON.stringify(house.images),
      starting_price: house.starting_price,
      bid_increment: house.bid_increment,
      current_price: house.starting_price,
      reserve_price: house.reserve_price,
      ends_at: house.ends_at,
      make: null,
      model: null,
      year: null,
      mileage: null,
      fuel_type: null,
      transmission: null,
      vin: null,
      address: house.address,
      bedrooms: house.bedrooms,
      bathrooms: house.bathrooms,
      sqft: house.sqft,
      lot_size: house.lot_size,
      year_built: house.year_built,
      property_type: house.property_type,
    });
  }

  // Seed a few opening bids on some listings for realism
  const listingIds = db.prepare("SELECT id, starting_price, bid_increment, seller_id FROM listings").all();
  const insertBid = db.prepare("INSERT INTO bids (listing_id, bidder_id, amount) VALUES (?, ?, ?)");
  const updatePrice = db.prepare("UPDATE listings SET current_price = ? WHERE id = ?");

  listingIds.forEach((listing, idx) => {
    if (idx % 2 === 0) return; // leave some with no bids
    const bidder = users.filter((u) => u.id !== listing.seller_id)[0];
    const amount = listing.starting_price + listing.bid_increment * 2;
    insertBid.run(listing.id, bidder.id, amount);
    updatePrice.run(amount, listing.id);
  });

  console.log(`Seeded ${users.length} users, ${cars.length} cars, ${houses.length} houses.`);
  console.log("Demo login: ava@example.com / password123 (all seeded users share this password)");
}

seed().then(() => process.exit(0));
