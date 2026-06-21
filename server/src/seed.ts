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

const productSeeds: Seed[] = [
  ["Fresh Bananas", "fruits_vegetables", 1.49, 1.99, "1 kg", 120, false, 4.6, 214, "Naturally sweet, energy-packed bananas picked at peak ripeness."],
  ["Crisp Red Apples", "fruits_vegetables", 3.29, 3.99, "1 kg", 90, false, 4.7, 308, "Juicy, crunchy apples — perfect for snacking or baking."],
  ["Farm Carrots", "fruits_vegetables", 1.19, 1.59, "500 g", 140, true, 4.3, 87, "Crunchy organic carrots, great raw, roasted or juiced."],
  ["Organic Baby Spinach", "fruits_vegetables", 2.49, 2.99, "500 g", 80, true, 4.6, 121, "Tender organic spinach leaves, washed and ready to cook."],
  ["Full Cream Milk", "dairy_eggs", 1.29, 1.59, "1 L", 95, false, 4.7, 256, "Creamy, farm-fresh full cream milk, rich in calcium."],
  ["Free-Range Eggs", "dairy_eggs", 3.49, 3.99, "12 pcs", 70, false, 4.8, 312, "Wholesome free-range eggs from cage-free hens."],
  ["Butter Croissant", "bakery", 1.79, 2.29, "100 g", 40, false, 4.7, 167, "Flaky, golden croissant baked with real butter."],
  ["Organic Quinoa", "pantry_staples", 5.49, 6.49, "500 g", 60, true, 4.8, 198, "High-protein organic quinoa, naturally gluten-free."],
  ["Brown Rice", "pantry_staples", 3.99, 4.79, "1 kg", 85, false, 4.5, 76, "Nutty, fibre-rich whole-grain brown rice."],
  ["Classic Cola", "drinks", 1.79, 2.19, "1.5 L", 160, false, 4.5, 401, "Chilled, fizzy classic cola — refreshment in every sip."],
];

function calcDiscount(price: number, original: number): number {
  return original > price ? Math.round(((original - price) / original) * 100) : 0;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminEmail = (process.env.ADMIN_EMAILS || "admin@kiranaking.app").split(",")[0].trim();
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      password: await bcrypt.hash("admin123", 10),
      phone: "+1 555 0100",
    },
  });
  console.log(`  ✓ admin user (${adminEmail} / admin123)`);

  // Delivery partners
  const partners = [
    { name: "Marcus Reed", email: "marcus@kiranaking.app", phone: "+1 555 0143", vehicleType: "bike" },
    { name: "Priya Nair", email: "priya@kiranaking.app", phone: "+1 555 0177", vehicleType: "scooter" },
    { name: "Diego Santos", email: "diego@kiranaking.app", phone: "+1 555 0190", vehicleType: "car" },
  ];
  for (const p of partners) {
    await prisma.deliveryPartner.upsert({
      where: { email: p.email },
      update: {},
      create: { ...p, password: await bcrypt.hash("partner123", 10) },
    });
  }
  console.log(`  ✓ ${partners.length} delivery partners (password: partner123)`);

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
