import type { Category, DeliveryPartner, Order, Product } from "../types";
import heroBg from "./hero_bg.jpeg";
import deliveryTruck from "./delivery_truck.svg";

/**
 * Asset loading
 * ----------------------------------------------------------------------------
 * Category images live at the root of /assets, product images inside
 * `productpage/productpage img`. We eagerly glob both folders so we can map
 * dummy data to real files by name without dozens of individual imports.
 * (Folder names contain spaces — globbing sidesteps any import-path issues.)
 */
const categoryImages = import.meta.glob("./*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const productImages = import.meta.glob(
  "./productpage/productpage img/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
) as Record<string, string>;

const catImg = (name: string) => categoryImages[`./${name}.png`] ?? "";
const pImg = (file: string) =>
  productImages[`./productpage/productpage img/${file}`] ?? "";

export const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

/** Leaflet marker icons (truck = delivery partner, destination = drop-off pin). */
const destinationPin =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#f97316" stroke="white" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/></svg>`
  );

export const iconsForLeafpad = {
  truck: deliveryTruck,
  destination: destinationPin,
};

export const heroSectionData = {
  hero_image: heroBg,
  delivery_truck: deliveryTruck,
  title: "Fresh groceries, delivered in minutes",
  subtitle: "Farm-fresh produce, daily essentials and more — at your door before you know it.",
};

/* -------------------------------------------------------------------------- */
/*  Categories                                                                */
/* -------------------------------------------------------------------------- */
export const categoriesData: Category[] = [
  { slug: "fruits_vegetables", name: "Fruits & Vegetables", image: catImg("fruits_vegetables") },
  { slug: "dairy_eggs", name: "Dairy & Eggs", image: catImg("dairy_eggs") },
  { slug: "bakery", name: "Bakery", image: catImg("bakery") },
  { slug: "pantry_staples", name: "Pantry Staples", image: catImg("pantry_staples") },
  { slug: "drinks", name: "Beverages", image: catImg("drinks") },
  { slug: "snacks", name: "Snacks", image: catImg("snacks") },
  { slug: "meat_seafood", name: "Meat & Seafood", image: catImg("meat_seafood") },
  { slug: "frozen_foods", name: "Frozen Foods", image: catImg("frozen_foods") },
  { slug: "personal_care", name: "Personal Care", image: catImg("personal_care") },
  { slug: "baby_care", name: "Baby Care", image: catImg("baby_care") },
];

// Alias kept for components that import `categories`.
export const categories = categoriesData;

/* -------------------------------------------------------------------------- */
/*  Products                                                                  */
/* -------------------------------------------------------------------------- */
type Seed = [
  file: string,
  name: string,
  category: string,
  price: number,
  originalPrice: number,
  unit: string,
  stock: number,
  organic: boolean,
  rating: number,
  reviewCount: number,
  description: string
];

const productSeeds: Seed[] = [
  ["12_banana_1_kg.png", "Fresh Bananas", "fruits_vegetables", 1.49, 1.99, "1 kg", 120, false, 4.6, 214, "Naturally sweet, energy-packed bananas picked at peak ripeness."],
  ["27_apple_1_kg.png", "Crisp Red Apples", "fruits_vegetables", 3.29, 3.99, "1 kg", 90, false, 4.7, 308, "Juicy, crunchy apples — perfect for snacking, baking or salads."],
  ["22_mango_1_kg.png", "Alphonso Mangoes", "fruits_vegetables", 4.99, 6.49, "1 kg", 60, false, 4.8, 176, "Rich, golden and fragrant mangoes, the king of summer fruit."],
  ["19_grapes_500g.png", "Seedless Green Grapes", "fruits_vegetables", 2.79, 3.29, "500 g", 75, false, 4.4, 98, "Plump, seedless grapes with a refreshing sweet-tart bite."],
  ["17_orange_1_kg.png", "Navel Oranges", "fruits_vegetables", 2.99, 3.49, "1 kg", 110, false, 4.5, 142, "Vitamin-C rich oranges, easy to peel and bursting with juice."],
  ["8_carrot_500g.png", "Farm Carrots", "fruits_vegetables", 1.19, 1.59, "500 g", 140, true, 4.3, 87, "Crunchy organic carrots, great raw, roasted or juiced."],
  ["16_spinach_500g.png", "Organic Baby Spinach", "fruits_vegetables", 2.49, 2.99, "500 g", 80, true, 4.6, 121, "Tender organic spinach leaves, washed and ready to cook."],
  ["23_tomato_1_kg.png", "Vine Tomatoes", "fruits_vegetables", 1.89, 2.29, "1 kg", 130, false, 4.2, 64, "Ripe, tangy tomatoes ideal for curries, sauces and salads."],
  ["24_potato_500g.png", "Everyday Potatoes", "fruits_vegetables", 0.99, 1.29, "500 g", 200, false, 4.1, 53, "Versatile all-purpose potatoes for frying, mashing or roasting."],
  ["14_onion_500g.png", "Red Onions", "fruits_vegetables", 0.89, 1.19, "500 g", 180, false, 4.0, 47, "Sharp, flavourful red onions — a kitchen essential."],
  ["26_amul_milk_1l.png", "Full Cream Milk", "dairy_eggs", 1.29, 1.59, "1 L", 95, false, 4.7, 256, "Creamy, farm-fresh full cream milk, rich in calcium."],
  ["11_eggs_12_pcs.png", "Free-Range Eggs", "dairy_eggs", 3.49, 3.99, "12 pcs", 70, false, 4.8, 312, "Wholesome free-range eggs from cage-free hens."],
  ["21_paneer_200g.png", "Fresh Paneer", "dairy_eggs", 2.99, 3.49, "200 g", 55, false, 4.5, 88, "Soft, protein-rich cottage cheese for your favourite dishes."],
  ["25_cheese_200g.png", "Cheddar Cheese Block", "dairy_eggs", 4.29, 4.99, "200 g", 48, false, 4.6, 134, "Aged cheddar with a smooth, mature flavour."],
  ["1_butter_croissant_100g.png", "Butter Croissant", "bakery", 1.79, 2.29, "100 g", 40, false, 4.7, 167, "Flaky, golden croissant baked with real butter."],
  ["3_brown_bread_400g.png", "Whole Wheat Bread", "bakery", 1.99, 2.49, "400 g", 65, false, 4.4, 102, "Soft, fibre-rich brown bread baked fresh daily."],
  ["2_organic_quinoa_500g.png", "Organic Quinoa", "pantry_staples", 5.49, 6.49, "500 g", 60, true, 4.8, 198, "High-protein organic quinoa, naturally gluten-free."],
  ["4_barley_1kg.png", "Pearl Barley", "pantry_staples", 3.19, 3.79, "1 kg", 70, false, 4.3, 41, "Wholesome barley grains for soups, stews and salads."],
  ["10_brown_rice_1kg.png", "Brown Rice", "pantry_staples", 3.99, 4.79, "1 kg", 85, false, 4.5, 76, "Nutty, fibre-rich whole-grain brown rice."],
  ["13_basmati_rice_5kg.png", "Aged Basmati Rice", "pantry_staples", 12.99, 15.49, "5 kg", 50, false, 4.9, 421, "Long-grain aged basmati with an unmistakable aroma."],
  ["18_wheat_flour_5kg.png", "Whole Wheat Flour", "pantry_staples", 6.49, 7.99, "5 kg", 90, false, 4.6, 188, "Stone-ground whole wheat flour for soft rotis and bread."],
  ["6_maggi_noodles_280g.png", "Instant Masala Noodles", "pantry_staples", 1.99, 2.49, "280 g", 150, false, 4.2, 233, "Quick-cook noodles with a savoury spice mix."],
  ["5_knorr_cup_soup_70g.png", "Instant Cup Soup", "pantry_staples", 1.49, 1.89, "70 g", 120, false, 4.0, 59, "Warm, comforting cup soup ready in minutes."],
  ["9_coca_cola_1_5l.png", "Classic Cola", "drinks", 1.79, 2.19, "1.5 L", 160, false, 4.5, 401, "Chilled, fizzy classic cola — refreshment in every sip."],
  ["7_sprite_1_5l.png", "Lemon-Lime Soda", "drinks", 1.79, 2.19, "1.5 L", 150, false, 4.4, 287, "Crisp, clear lemon-lime soda with a citrus kick."],
  ["20_fanta_1_5l.png", "Orange Fizz", "drinks", 1.79, 2.19, "1.5 L", 140, false, 4.3, 192, "Bright, bubbly orange soda the whole family loves."],
  ["15_7_up_1_5l.png", "Clear Citrus Soda", "drinks", 1.79, 2.19, "1.5 L", 130, false, 4.2, 151, "Light, refreshing citrus soda — caffeine free."],
  ["28_pampers_diapers_xl_56.jpg", "Pampers Complete Skin Comfort Diaper Pants XL", "baby_care", 14.99, 18.99, "56 pants", 75, false, 4.7, 1342, "Anti-rash blanket with lotion, aloe & Vitamin E. Up to 100% leak-proof, all-night comfort for 12-17 kg babies."],
  ["29_littles_baby_wipes_80x3.jpg", "Little's Soft Cleansing Baby Wipes (Pack of 3)", "baby_care", 6.49, 8.49, "3 x 80 wipes", 110, false, 4.6, 876, "Extra thick & moist wipes with aloe vera, Vitamin E & jojoba oil. Paraben-free, alcohol-free and pH balanced."],
  ["30_tedibar_nappi_rash_cream_75g.jpg", "Tedibar B4 Nappi Diaper Rash Cream", "baby_care", 4.99, 5.99, "75 g", 90, false, 4.5, 421, "Soothing diaper rash cream with zinc oxide, calendula oil & allantoin. Prevents and heals nappy rash."],
  ["31_gillette_mach3_turbo_10.jpg", "Gillette Mach3 Turbo Razor Blades", "personal_care", 19.99, 24.99, "10 cartridges", 65, false, 4.8, 2103, "Pack of 10 Mach3 Turbo refill cartridges for a smooth, close shave with reduced irritation."],
  ["32_miduty_dermal_sunscreen_spf50.webp", "Miduty Dermal Sun Protect 50 Sunscreen", "personal_care", 16.99, 21.99, "50 ml", 80, false, 4.4, 318, "Tinted mineral sunscreen SPF 50 PA+++ with UVA, UVB, IR & blue-light protection. 20% zinc oxide, non-greasy finish."],
  ["33_minimalist_b12_moisturizer_50g.jpg", "Minimalist B12 + Repair Complex Face Moisturizer", "personal_care", 11.99, 14.99, "50 g", 95, false, 4.6, 1547, "5.5% B12 repair complex with ceramides & betaine. Repairs the skin barrier and soothes all skin types."],
  ["34_soultari_butter_chicken_2pack.jpg", "Soul Tari Smoky Butter Chicken (Pack of 2)", "frozen_foods", 9.99, 12.99, "2 x 300 g", 50, false, 4.5, 264, "Ready-to-eat smoky butter chicken from master chefs. Just heat and serve a rich, restaurant-style meal."],
  ["35_prolicious_baked_mathri_50g.jpg", "Prolicious Baked Mathri Methi", "frozen_foods", 2.49, 2.99, "50 g", 130, false, 4.3, 188, "Baked, not fried, methi mathri with 10g protein & 5g fibre per pack — a guilt-free crunchy snack."],
  ["36_proskii_protein_cereal_2pack.jpg", "Proskii High Protein Cereal Mocha Madness (Pack of 2)", "frozen_foods", 13.99, 17.49, "2 x 250 g", 60, false, 4.4, 142, "High-protein breakfast cereal with 38g protein per 100g, 0g added sugar and 100% plant protein."],
];

export const dummyProducts: Product[] = productSeeds.map((s, i) => {
  const [file, name, category, price, originalPrice, unit, stock, isOrganic, rating, reviewCount, description] = s;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  return {
    _id: `prod_${String(i + 1).padStart(3, "0")}`,
    name,
    description,
    price,
    originalPrice,
    image: pImg(file),
    category,
    unit,
    stock,
    isOrganic,
    rating,
    reviewCount,
    discount,
    createdAt: new Date(Date.now() - i * 36e5).toISOString(),
  };
});

/** Products with the deepest discounts — used by the Flash Deals page. */
export const dummyDeals: Product[] = [...dummyProducts]
  .filter((p) => p.discount > 0)
  .sort((a, b) => b.discount - a.discount)
  .slice(0, 8);

/* -------------------------------------------------------------------------- */
/*  Status colours (shared by admin / delivery / tracking)                    */
/* -------------------------------------------------------------------------- */
export const statusColors: Record<string, string> = {
  Placed: "bg-blue-100 text-blue-800",
  Confirmed: "bg-amber-100 text-amber-800",
  Assigned: "bg-indigo-100 text-indigo-800",
  Packed: "bg-cyan-100 text-cyan-800",
  "Out for Delivery": "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export const orderStatuses = [
  "Placed",
  "Confirmed",
  "Assigned",
  "Packed",
  "Out for Delivery",
  "Delivered",
] as const;

/* -------------------------------------------------------------------------- */
/*  Delivery partners                                                         */
/* -------------------------------------------------------------------------- */
export const dummyDeliveryPartnerData: DeliveryPartner[] = [
  { _id: "dp_001", name: "Marcus Reed", email: "marcus@kiranaking.app", phone: "+1 555 0143", avatar: "", vehicleType: "bike", isActive: true, createdAt: new Date().toISOString() },
  { _id: "dp_002", name: "Priya Nair", email: "priya@kiranaking.app", phone: "+1 555 0177", avatar: "", vehicleType: "scooter", isActive: true, createdAt: new Date().toISOString() },
  { _id: "dp_003", name: "Diego Santos", email: "diego@kiranaking.app", phone: "+1 555 0190", avatar: "", vehicleType: "car", isActive: false, createdAt: new Date().toISOString() },
];

/* -------------------------------------------------------------------------- */
/*  Orders                                                                    */
/* -------------------------------------------------------------------------- */
const sampleAddress = {
  label: "Home",
  address: "742 Maple Avenue, Apt 5",
  city: "Springfield",
  state: "IL",
  zip: "62704",
  lat: 39.7817,
  lng: -89.6501,
};

const toOrderItem = (p: Product, quantity: number) => ({
  product: p._id,
  name: p.name,
  image: p.image,
  price: p.price,
  quantity,
  unit: p.unit,
});

const buildOrder = (
  id: string,
  status: string,
  items: { p: Product; q: number }[],
  opts: { partner?: DeliveryPartner | null; isPaid?: boolean; paymentMethod?: string; hoursAgo?: number } = {}
): Order => {
  const orderItems = items.map((it) => toOrderItem(it.p, it.q));
  const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const deliveryFee = subtotal > 35 ? 0 : 2.99;
  const tax = +(subtotal * 0.07).toFixed(2);
  const created = new Date(Date.now() - (opts.hoursAgo ?? 2) * 36e5).toISOString();
  return {
    _id: id,
    user: { _id: "usr_001", name: "Jordan Avery", email: "jordan@example.com", phone: "+1 555 0102" },
    items: orderItems,
    shippingAddress: sampleAddress,
    paymentMethod: opts.paymentMethod ?? "card",
    subtotal: +subtotal.toFixed(2),
    deliveryFee,
    tax,
    total: +(subtotal + deliveryFee + tax).toFixed(2),
    status,
    statusHistory: [{ status: "Placed", timestamp: created, note: "Order received" }],
    deliveryPartner: opts.partner ?? null,
    deliveryOtp: status === "Out for Delivery" || status === "Assigned" ? "418205" : "",
    isPaid: opts.isPaid ?? false,
    createdAt: created,
  };
};

export const dummyDashboardOrdersData: Order[] = [
  buildOrder("ord_1001", "Out for Delivery", [{ p: dummyProducts[0], q: 2 }, { p: dummyProducts[10], q: 1 }, { p: dummyProducts[14], q: 3 }], { partner: dummyDeliveryPartnerData[0], isPaid: true, hoursAgo: 1 }),
  buildOrder("ord_1002", "Placed", [{ p: dummyProducts[3], q: 1 }, { p: dummyProducts[5], q: 2 }], { paymentMethod: "cod", hoursAgo: 3 }),
  buildOrder("ord_1003", "Confirmed", [{ p: dummyProducts[19], q: 1 }], { isPaid: true, hoursAgo: 6 }),
  buildOrder("ord_1004", "Assigned", [{ p: dummyProducts[11], q: 2 }, { p: dummyProducts[12], q: 1 }], { partner: dummyDeliveryPartnerData[1], isPaid: true, hoursAgo: 9 }),
  buildOrder("ord_1005", "Delivered", [{ p: dummyProducts[1], q: 4 }], { partner: dummyDeliveryPartnerData[0], isPaid: true, hoursAgo: 30 }),
  buildOrder("ord_1006", "Cancelled", [{ p: dummyProducts[23], q: 6 }], { paymentMethod: "cod", hoursAgo: 48 }),
];

/** Orders that belong to the signed-in customer (My Orders page). */
export const dummyMyOrders: Order[] = dummyDashboardOrdersData;

/* -------------------------------------------------------------------------- */
/*  Admin dashboard summary                                                   */
/* -------------------------------------------------------------------------- */
export const dummyAdminDashboardData = {
  totalOrders: 1284,
  totalUsers: 642,
  totalProducts: dummyProducts.length,
  outOfStock: dummyProducts.filter((p) => p.stock === 0).length,
  recentOrders: dummyDashboardOrdersData.slice(0, 5),
};
