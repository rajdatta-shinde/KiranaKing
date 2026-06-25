import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./lib/prisma";

/* Minimal seed: one admin, a few delivery partners, a starter catalogue.
   Product images use Cloudinary/remote URLs in production — here we leave a
   placeholder filename so the admin can re-upload, or swap in real URLs. */

type Seed = [
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

/* Names mirror the client's bundled catalogue artwork so seeded products render
   with images via the frontend's name-based image fallback. */
const productSeeds: Seed[] = [
  ["Fresh Bananas", "fruits_vegetables", 1.49, 1.99, "1 kg", 120, false, 4.6, 214, "Naturally sweet, energy-packed bananas picked at peak ripeness."],
  ["Crisp Red Apples", "fruits_vegetables", 3.29, 3.99, "1 kg", 90, false, 4.7, 308, "Juicy, crunchy apples — perfect for snacking, baking or salads."],
  ["Alphonso Mangoes", "fruits_vegetables", 4.99, 6.49, "1 kg", 60, false, 4.8, 176, "Rich, golden and fragrant mangoes, the king of summer fruit."],
  ["Seedless Green Grapes", "fruits_vegetables", 2.79, 3.29, "500 g", 75, false, 4.4, 98, "Plump, seedless grapes with a refreshing sweet-tart bite."],
  ["Navel Oranges", "fruits_vegetables", 2.99, 3.49, "1 kg", 110, false, 4.5, 142, "Vitamin-C rich oranges, easy to peel and bursting with juice."],
  ["Farm Carrots", "fruits_vegetables", 1.19, 1.59, "500 g", 140, true, 4.3, 87, "Crunchy organic carrots, great raw, roasted or juiced."],
  ["Organic Baby Spinach", "fruits_vegetables", 2.49, 2.99, "500 g", 80, true, 4.6, 121, "Tender organic spinach leaves, washed and ready to cook."],
  ["Vine Tomatoes", "fruits_vegetables", 1.89, 2.29, "1 kg", 130, false, 4.2, 64, "Ripe, tangy tomatoes ideal for curries, sauces and salads."],
  ["Everyday Potatoes", "fruits_vegetables", 0.99, 1.29, "500 g", 200, false, 4.1, 53, "Versatile all-purpose potatoes for frying, mashing or roasting."],
  ["Red Onions", "fruits_vegetables", 0.89, 1.19, "500 g", 180, false, 4.0, 47, "Sharp, flavourful red onions — a kitchen essential."],
  ["Full Cream Milk", "dairy_eggs", 1.29, 1.59, "1 L", 95, false, 4.7, 256, "Creamy, farm-fresh full cream milk, rich in calcium."],
  ["Free-Range Eggs", "dairy_eggs", 3.49, 3.99, "12 pcs", 70, false, 4.8, 312, "Wholesome free-range eggs from cage-free hens."],
  ["Fresh Paneer", "dairy_eggs", 2.99, 3.49, "200 g", 55, false, 4.5, 88, "Soft, protein-rich cottage cheese for your favourite dishes."],
  ["Cheddar Cheese Block", "dairy_eggs", 4.29, 4.99, "200 g", 48, false, 4.6, 134, "Aged cheddar with a smooth, mature flavour."],
  ["Butter Croissant", "bakery", 1.79, 2.29, "100 g", 40, false, 4.7, 167, "Flaky, golden croissant baked with real butter."],
  ["Whole Wheat Bread", "bakery", 1.99, 2.49, "400 g", 65, false, 4.4, 102, "Soft, fibre-rich brown bread baked fresh daily."],
  ["Organic Quinoa", "pantry_staples", 5.49, 6.49, "500 g", 60, true, 4.8, 198, "High-protein organic quinoa, naturally gluten-free."],
  ["Pearl Barley", "pantry_staples", 3.19, 3.79, "1 kg", 70, false, 4.3, 41, "Wholesome barley grains for soups, stews and salads."],
  ["Brown Rice", "pantry_staples", 3.99, 4.79, "1 kg", 85, false, 4.5, 76, "Nutty, fibre-rich whole-grain brown rice."],
  ["Aged Basmati Rice", "pantry_staples", 12.99, 15.49, "5 kg", 50, false, 4.9, 421, "Long-grain aged basmati with an unmistakable aroma."],
  ["Whole Wheat Flour", "pantry_staples", 6.49, 7.99, "5 kg", 90, false, 4.6, 188, "Stone-ground whole wheat flour for soft rotis and bread."],
  ["Instant Masala Noodles", "pantry_staples", 1.99, 2.49, "280 g", 150, false, 4.2, 233, "Quick-cook noodles with a savoury spice mix."],
  ["Instant Cup Soup", "pantry_staples", 1.49, 1.89, "70 g", 120, false, 4.0, 59, "Warm, comforting cup soup ready in minutes."],
  ["Classic Cola", "drinks", 1.79, 2.19, "1.5 L", 160, false, 4.5, 401, "Chilled, fizzy classic cola — refreshment in every sip."],
  ["Lemon-Lime Soda", "drinks", 1.79, 2.19, "1.5 L", 150, false, 4.4, 287, "Crisp, clear lemon-lime soda with a citrus kick."],
  ["Orange Fizz", "drinks", 1.79, 2.19, "1.5 L", 140, false, 4.3, 192, "Bright, bubbly orange soda the whole family loves."],
  ["Clear Citrus Soda", "drinks", 1.79, 2.19, "1.5 L", 130, false, 4.2, 151, "Light, refreshing citrus soda — caffeine free."],
  ["Pampers Complete Skin Comfort Diaper Pants XL", "baby_care", 14.99, 18.99, "56 pants", 75, false, 4.7, 1342, "Anti-rash blanket with lotion, aloe & Vitamin E. Up to 100% leak-proof, all-night comfort for 12-17 kg babies."],
  ["Little's Soft Cleansing Baby Wipes (Pack of 3)", "baby_care", 6.49, 8.49, "3 x 80 wipes", 110, false, 4.6, 876, "Extra thick & moist wipes with aloe vera, Vitamin E & jojoba oil. Paraben-free, alcohol-free and pH balanced."],
  ["Tedibar B4 Nappi Diaper Rash Cream", "baby_care", 4.99, 5.99, "75 g", 90, false, 4.5, 421, "Soothing diaper rash cream with zinc oxide, calendula oil & allantoin. Prevents and heals nappy rash."],
  ["Gillette Mach3 Turbo Razor Blades", "personal_care", 19.99, 24.99, "10 cartridges", 65, false, 4.8, 2103, "Pack of 10 Mach3 Turbo refill cartridges for a smooth, close shave with reduced irritation."],
  ["Miduty Dermal Sun Protect 50 Sunscreen", "personal_care", 16.99, 21.99, "50 ml", 80, false, 4.4, 318, "Tinted mineral sunscreen SPF 50 PA+++ with UVA, UVB, IR & blue-light protection. 20% zinc oxide, non-greasy finish."],
  ["Minimalist B12 + Repair Complex Face Moisturizer", "personal_care", 11.99, 14.99, "50 g", 95, false, 4.6, 1547, "5.5% B12 repair complex with ceramides & betaine. Repairs the skin barrier and soothes all skin types."],
  ["Soul Tari Smoky Butter Chicken (Pack of 2)", "frozen_foods", 9.99, 12.99, "2 x 300 g", 50, false, 4.5, 264, "Ready-to-eat smoky butter chicken from master chefs. Just heat and serve a rich, restaurant-style meal."],
  ["Prolicious Baked Mathri Methi", "frozen_foods", 2.49, 2.99, "50 g", 130, false, 4.3, 188, "Baked, not fried, methi mathri with 10g protein & 5g fibre per pack — a guilt-free crunchy snack."],
  ["Proskii High Protein Cereal Mocha Madness (Pack of 2)", "frozen_foods", 13.99, 17.49, "2 x 250 g", 60, false, 4.4, 142, "High-protein breakfast cereal with 38g protein per 100g, 0g added sugar and 100% plant protein."],
];

function calcDiscount(price: number, original: number): number {
  return original > price ? Math.round(((original - price) / original) * 100) : 0;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Remove any previously seeded credentials.
  await prisma.deliveryPartner.deleteMany();
  await prisma.user.deleteMany({ where: { email: "admin@kiranaking.app" } });

  // Admin user
  const adminEmail = (process.env.ADMIN_EMAILS || "admin123@gmail.com").split(",")[0].trim();
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: await bcrypt.hash("admin123", 10) },
    create: {
      name: "Admin",
      email: adminEmail,
      password: await bcrypt.hash("admin123", 10),
      phone: "+1 555 0100",
    },
  });
  console.log(`  ✓ admin user (${adminEmail} / admin123)`);

  // Products — clear then insert for a deterministic catalogue.
  await prisma.product.deleteMany();
  for (const [name, category, price, originalPrice, unit, stock, isOrganic, rating, reviewCount, description] of productSeeds) {
    await prisma.product.create({
      data: {
        name,
        category,
        price,
        originalPrice,
        discount: calcDiscount(price, originalPrice),
        unit,
        stock,
        isOrganic,
        rating,
        reviewCount,
        description,
        image: "", // upload via admin panel, or set a Cloudinary URL
      },
    });
  }
  console.log(`  ✓ ${productSeeds.length} products`);
  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
