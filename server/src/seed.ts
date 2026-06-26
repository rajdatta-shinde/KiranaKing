import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import prisma from "./lib/prisma";
import { uploadImage } from "./lib/cloudinary";

/**
 * Catalogue seeder
 * ----------------------------------------------------------------------------
 * Adds products the *real* way: each image is uploaded to Cloudinary (the exact
 * step the admin "Add product" form performs) and the row is written to
 * Postgres via Prisma. It's just the admin flow run in a loop so we don't have
 * to add three dozen products by hand.
 *
 * Idempotent & non-destructive: it never deletes anything, and a product whose
 * `name` already exists is skipped — so re-running is safe and your manually
 * added products are left untouched.
 *
 * Run from the server/ folder:  npm run db:seed
 */

const IMAGES_DIR = path.resolve(
  __dirname,
  "../../client/src/assets/productpage/productpage img"
);

function calcDiscount(price: number, original: number): number {
  return original > price ? Math.round(((original - price) / original) * 100) : 0;
}

type Seed = {
  file: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  unit: string;
  stock: number;
  organic: boolean;
  rating: number;
  reviewCount: number;
  description: string;
};

const productSeeds: Seed[] = [
  { file: "12_banana_1_kg.png", name: "Fresh Bananas", category: "fruits_vegetables", price: 1.49, originalPrice: 1.99, unit: "1 kg", stock: 120, organic: false, rating: 4.6, reviewCount: 214, description: "Naturally sweet, energy-packed bananas picked at peak ripeness." },
  { file: "27_apple_1_kg.png", name: "Crisp Red Apples", category: "fruits_vegetables", price: 3.29, originalPrice: 3.99, unit: "1 kg", stock: 90, organic: false, rating: 4.7, reviewCount: 308, description: "Juicy, crunchy apples — perfect for snacking, baking or salads." },
  { file: "22_mango_1_kg.png", name: "Alphonso Mangoes", category: "fruits_vegetables", price: 4.99, originalPrice: 6.49, unit: "1 kg", stock: 60, organic: false, rating: 4.8, reviewCount: 176, description: "Rich, golden and fragrant mangoes, the king of summer fruit." },
  { file: "19_grapes_500g.png", name: "Seedless Green Grapes", category: "fruits_vegetables", price: 2.79, originalPrice: 3.29, unit: "500 g", stock: 75, organic: false, rating: 4.4, reviewCount: 98, description: "Plump, seedless grapes with a refreshing sweet-tart bite." },
  { file: "17_orange_1_kg.png", name: "Navel Oranges", category: "fruits_vegetables", price: 2.99, originalPrice: 3.49, unit: "1 kg", stock: 110, organic: false, rating: 4.5, reviewCount: 142, description: "Vitamin-C rich oranges, easy to peel and bursting with juice." },
  { file: "8_carrot_500g.png", name: "Farm Carrots", category: "fruits_vegetables", price: 1.19, originalPrice: 1.59, unit: "500 g", stock: 140, organic: true, rating: 4.3, reviewCount: 87, description: "Crunchy organic carrots, great raw, roasted or juiced." },
  { file: "16_spinach_500g.png", name: "Organic Baby Spinach", category: "fruits_vegetables", price: 2.49, originalPrice: 2.99, unit: "500 g", stock: 80, organic: true, rating: 4.6, reviewCount: 121, description: "Tender organic spinach leaves, washed and ready to cook." },
  { file: "23_tomato_1_kg.png", name: "Vine Tomatoes", category: "fruits_vegetables", price: 1.89, originalPrice: 2.29, unit: "1 kg", stock: 130, organic: false, rating: 4.2, reviewCount: 64, description: "Ripe, tangy tomatoes ideal for curries, sauces and salads." },
  { file: "24_potato_500g.png", name: "Everyday Potatoes", category: "fruits_vegetables", price: 0.99, originalPrice: 1.29, unit: "500 g", stock: 200, organic: false, rating: 4.1, reviewCount: 53, description: "Versatile all-purpose potatoes for frying, mashing or roasting." },
  { file: "14_onion_500g.png", name: "Red Onions", category: "fruits_vegetables", price: 0.89, originalPrice: 1.19, unit: "500 g", stock: 180, organic: false, rating: 4.0, reviewCount: 47, description: "Sharp, flavourful red onions — a kitchen essential." },
  { file: "26_amul_milk_1l.png", name: "Full Cream Milk", category: "dairy_eggs", price: 1.29, originalPrice: 1.59, unit: "1 L", stock: 95, organic: false, rating: 4.7, reviewCount: 256, description: "Creamy, farm-fresh full cream milk, rich in calcium." },
  { file: "11_eggs_12_pcs.png", name: "Free-Range Eggs", category: "dairy_eggs", price: 3.49, originalPrice: 3.99, unit: "12 pcs", stock: 70, organic: false, rating: 4.8, reviewCount: 312, description: "Wholesome free-range eggs from cage-free hens." },
  { file: "21_paneer_200g.png", name: "Fresh Paneer", category: "dairy_eggs", price: 2.99, originalPrice: 3.49, unit: "200 g", stock: 55, organic: false, rating: 4.5, reviewCount: 88, description: "Soft, protein-rich cottage cheese for your favourite dishes." },
  { file: "25_cheese_200g.png", name: "Cheddar Cheese Block", category: "dairy_eggs", price: 4.29, originalPrice: 4.99, unit: "200 g", stock: 48, organic: false, rating: 4.6, reviewCount: 134, description: "Aged cheddar with a smooth, mature flavour." },
  { file: "1_butter_croissant_100g.png", name: "Butter Croissant", category: "bakery", price: 1.79, originalPrice: 2.29, unit: "100 g", stock: 40, organic: false, rating: 4.7, reviewCount: 167, description: "Flaky, golden croissant baked with real butter." },
  { file: "3_brown_bread_400g.png", name: "Whole Wheat Bread", category: "bakery", price: 1.99, originalPrice: 2.49, unit: "400 g", stock: 65, organic: false, rating: 4.4, reviewCount: 102, description: "Soft, fibre-rich brown bread baked fresh daily." },
  { file: "2_organic_quinoa_500g.png", name: "Organic Quinoa", category: "pantry_staples", price: 5.49, originalPrice: 6.49, unit: "500 g", stock: 60, organic: true, rating: 4.8, reviewCount: 198, description: "High-protein organic quinoa, naturally gluten-free." },
  { file: "4_barley_1kg.png", name: "Pearl Barley", category: "pantry_staples", price: 3.19, originalPrice: 3.79, unit: "1 kg", stock: 70, organic: false, rating: 4.3, reviewCount: 41, description: "Wholesome barley grains for soups, stews and salads." },
  { file: "10_brown_rice_1kg.png", name: "Brown Rice", category: "pantry_staples", price: 3.99, originalPrice: 4.79, unit: "1 kg", stock: 85, organic: false, rating: 4.5, reviewCount: 76, description: "Nutty, fibre-rich whole-grain brown rice." },
  { file: "13_basmati_rice_5kg.png", name: "Aged Basmati Rice", category: "pantry_staples", price: 12.99, originalPrice: 15.49, unit: "5 kg", stock: 50, organic: false, rating: 4.9, reviewCount: 421, description: "Long-grain aged basmati with an unmistakable aroma." },
  { file: "18_wheat_flour_5kg.png", name: "Whole Wheat Flour", category: "pantry_staples", price: 6.49, originalPrice: 7.99, unit: "5 kg", stock: 90, organic: false, rating: 4.6, reviewCount: 188, description: "Stone-ground whole wheat flour for soft rotis and bread." },
  { file: "6_maggi_noodles_280g.png", name: "Instant Masala Noodles", category: "pantry_staples", price: 1.99, originalPrice: 2.49, unit: "280 g", stock: 150, organic: false, rating: 4.2, reviewCount: 233, description: "Quick-cook noodles with a savoury spice mix." },
  { file: "5_knorr_cup_soup_70g.png", name: "Instant Cup Soup", category: "pantry_staples", price: 1.49, originalPrice: 1.89, unit: "70 g", stock: 120, organic: false, rating: 4.0, reviewCount: 59, description: "Warm, comforting cup soup ready in minutes." },
  { file: "9_coca_cola_1_5l.png", name: "Classic Cola", category: "drinks", price: 1.79, originalPrice: 2.19, unit: "1.5 L", stock: 160, organic: false, rating: 4.5, reviewCount: 401, description: "Chilled, fizzy classic cola — refreshment in every sip." },
  { file: "7_sprite_1_5l.png", name: "Lemon-Lime Soda", category: "drinks", price: 1.79, originalPrice: 2.19, unit: "1.5 L", stock: 150, organic: false, rating: 4.4, reviewCount: 287, description: "Crisp, clear lemon-lime soda with a citrus kick." },
  { file: "20_fanta_1_5l.png", name: "Orange Fizz", category: "drinks", price: 1.79, originalPrice: 2.19, unit: "1.5 L", stock: 140, organic: false, rating: 4.3, reviewCount: 192, description: "Bright, bubbly orange soda the whole family loves." },
  { file: "15_7_up_1_5l.png", name: "Clear Citrus Soda", category: "drinks", price: 1.79, originalPrice: 2.19, unit: "1.5 L", stock: 130, organic: false, rating: 4.2, reviewCount: 151, description: "Light, refreshing citrus soda — caffeine free." },
  { file: "28_pampers_diapers_xl_56.jpg", name: "Pampers Complete Skin Comfort Diaper Pants XL", category: "baby_care", price: 14.99, originalPrice: 18.99, unit: "56 pants", stock: 75, organic: false, rating: 4.7, reviewCount: 1342, description: "Anti-rash blanket with lotion, aloe & Vitamin E. Up to 100% leak-proof, all-night comfort for 12-17 kg babies." },
  { file: "29_littles_baby_wipes_80x3.jpg", name: "Little's Soft Cleansing Baby Wipes (Pack of 3)", category: "baby_care", price: 6.49, originalPrice: 8.49, unit: "3 x 80 wipes", stock: 110, organic: false, rating: 4.6, reviewCount: 876, description: "Extra thick & moist wipes with aloe vera, Vitamin E & jojoba oil. Paraben-free, alcohol-free and pH balanced." },
  { file: "30_tedibar_nappi_rash_cream_75g.jpg", name: "Tedibar B4 Nappi Diaper Rash Cream", category: "baby_care", price: 4.99, originalPrice: 5.99, unit: "75 g", stock: 90, organic: false, rating: 4.5, reviewCount: 421, description: "Soothing diaper rash cream with zinc oxide, calendula oil & allantoin. Prevents and heals nappy rash." },
  { file: "31_gillette_mach3_turbo_10.jpg", name: "Gillette Mach3 Turbo Razor Blades", category: "personal_care", price: 19.99, originalPrice: 24.99, unit: "10 cartridges", stock: 65, organic: false, rating: 4.8, reviewCount: 2103, description: "Pack of 10 Mach3 Turbo refill cartridges for a smooth, close shave with reduced irritation." },
  { file: "32_miduty_dermal_sunscreen_spf50.webp", name: "Miduty Dermal Sun Protect 50 Sunscreen", category: "personal_care", price: 16.99, originalPrice: 21.99, unit: "50 ml", stock: 80, organic: false, rating: 4.4, reviewCount: 318, description: "Tinted mineral sunscreen SPF 50 PA+++ with UVA, UVB, IR & blue-light protection. 20% zinc oxide, non-greasy finish." },
  { file: "33_minimalist_b12_moisturizer_50g.jpg", name: "Minimalist B12 + Repair Complex Face Moisturizer", category: "personal_care", price: 11.99, originalPrice: 14.99, unit: "50 g", stock: 95, organic: false, rating: 4.6, reviewCount: 1547, description: "5.5% B12 repair complex with ceramides & betaine. Repairs the skin barrier and soothes all skin types." },
  { file: "34_soultari_butter_chicken_2pack.jpg", name: "Soul Tari Smoky Butter Chicken (Pack of 2)", category: "frozen_foods", price: 9.99, originalPrice: 12.99, unit: "2 x 300 g", stock: 50, organic: false, rating: 4.5, reviewCount: 264, description: "Ready-to-eat smoky butter chicken from master chefs. Just heat and serve a rich, restaurant-style meal." },
  { file: "35_prolicious_baked_mathri_50g.jpg", name: "Prolicious Baked Mathri Methi", category: "frozen_foods", price: 2.49, originalPrice: 2.99, unit: "50 g", stock: 130, organic: false, rating: 4.3, reviewCount: 188, description: "Baked, not fried, methi mathri with 10g protein & 5g fibre per pack — a guilt-free crunchy snack." },
  { file: "36_proskii_protein_cereal_2pack.jpg", name: "Proskii High Protein Cereal Mocha Madness (Pack of 2)", category: "frozen_foods", price: 13.99, originalPrice: 17.49, unit: "2 x 250 g", stock: 60, organic: false, rating: 4.4, reviewCount: 142, description: "High-protein breakfast cereal with 38g protein per 100g, 0g added sugar and 100% plant protein." },
];

async function seedAdmin() {
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
}

async function seedProducts() {
  console.log(`🌱 Seeding ${productSeeds.length} products (uploading images to Cloudinary)…\n`);
  let created = 0;
  let skipped = 0;

  for (const s of productSeeds) {
    const existing = await prisma.product.findFirst({ where: { name: s.name } });
    if (existing) {
      console.log(`  ⏭️  Skipped (already exists): ${s.name}`);
      skipped++;
      continue;
    }

    const filePath = path.join(IMAGES_DIR, s.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  Image not found, skipping: ${s.file}`);
      skipped++;
      continue;
    }

    // Upload the image to Cloudinary — the same step the admin form performs.
    const image = await uploadImage(fs.readFileSync(filePath));

    await prisma.product.create({
      data: {
        name: s.name,
        description: s.description,
        price: s.price,
        originalPrice: s.originalPrice,
        discount: calcDiscount(s.price, s.originalPrice),
        image,
        category: s.category,
        unit: s.unit,
        stock: s.stock,
        isOrganic: s.organic,
        rating: s.rating,
        reviewCount: s.reviewCount,
      },
    });

    console.log(`  ✅ Added: ${s.name}`);
    created++;
  }

  console.log(`\n  ✓ products: ${created} created, ${skipped} skipped.`);
}

async function main() {
  console.log("🌱 Seeding database...");
  await seedAdmin();
  await seedProducts();
  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
