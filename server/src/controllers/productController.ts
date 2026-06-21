import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { uploadImage } from "../lib/cloudinary";
import { inngest, EVENTS } from "../inngest/client";

function calcDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/** GET /api/products — supports category, search, organic, price, sort filters. */
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, organic, minPrice, maxPrice, sort } = req.query as Record<
    string,
    string | undefined
  >;

  const where: Prisma.ProductWhereInput = {};
  if (category) where.category = category;
  if (organic === "true") where.isOrganic = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (minPrice || maxPrice) {
    const price: Prisma.FloatFilter = {};
    if (minPrice) price.gte = Number(minPrice);
    if (maxPrice) price.lte = Number(maxPrice);
    where.price = price;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };

  const products = await prisma.product.findMany({ where, orderBy });
  res.json({ products });
});

/** GET /api/products/:id */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
});

/** POST /api/products  (admin) — accepts multipart image or an image URL. */
export const createProduct = asyncHandler(async (req, res) => {
  const b = req.body as Record<string, string>;
  if (!b.name || !b.price || !b.category) {
    return res.status(400).json({ message: "Name, price and category are required" });
  }

  let image = b.image || "";
  if (req.file) image = await uploadImage(req.file.buffer);
  if (!image) return res.status(400).json({ message: "Product image is required" });

  const price = Number(b.price);
  const originalPrice = Number(b.originalPrice || price);

  const product = await prisma.product.create({
    data: {
      name: b.name,
      description: b.description || "",
      price,
      originalPrice,
      discount: calcDiscount(price, originalPrice),
      image,
      category: b.category,
      unit: b.unit || "piece",
      stock: Number(b.stock || 0),
      isOrganic: b.isOrganic === "true",
    },
  });

  res.status(201).json({ product });
});

/** PUT /api/products/:id  (admin) — recomputes discount, fires stock event. */
export const updateProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Product not found" });

  const b = req.body as Record<string, string>;
  let image = existing.image;
  if (req.file) image = await uploadImage(req.file.buffer);
  else if (b.image) image = b.image;

  const price = b.price !== undefined ? Number(b.price) : existing.price;
  const originalPrice =
    b.originalPrice !== undefined ? Number(b.originalPrice) : existing.originalPrice ?? price;
  const stock = b.stock !== undefined ? Number(b.stock) : existing.stock ?? 0;
  const stockChanged = stock !== existing.stock;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      name: b.name ?? existing.name,
      description: b.description ?? existing.description,
      price,
      originalPrice,
      discount: calcDiscount(price, originalPrice),
      image,
      category: b.category ?? existing.category,
      unit: b.unit ?? existing.unit,
      stock,
      isOrganic: b.isOrganic !== undefined ? b.isOrganic === "true" : existing.isOrganic,
    },
  });

  if (stockChanged) {
    await inngest.send({ name: EVENTS.STOCK_UPDATED, data: { productId: product.id } });
  }

  res.json({ product });
});

/** DELETE /api/products/:id  (admin). */
export const deleteProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Product not found" });
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: "Product deleted" });
});
