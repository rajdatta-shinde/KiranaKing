import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { appendStatus } from "../lib/orderStatus";

/** GET /api/admin/dashboard — headline counts + recent orders. */
export const getDashboard = asyncHandler(async (_req, res) => {
  const [totalOrders, totalUsers, totalProducts, outOfStock, recentOrders, revenue] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { deliveryPartner: true, user: { select: { name: true, email: true } } },
      }),
      prisma.order.aggregate({ _sum: { total: true }, where: { isPaid: true } }),
    ]);

  res.json({
    totalOrders,
    totalUsers,
    totalProducts,
    outOfStock,
    totalRevenue: revenue._sum.total ?? 0,
    recentOrders,
  });
});

/** GET /api/admin/orders — all orders for the admin table. */
export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { deliveryPartner: true, user: { select: { name: true, email: true } } },
  });
  res.json({ orders });
});

/** PATCH /api/admin/orders/:id/assign — manually assign a partner. */
export const assignPartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.body as { partnerId?: string };
  if (!partnerId) return res.status(400).json({ message: "partnerId is required" });

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ message: "Order not found" });

  const partner = await prisma.deliveryPartner.findUnique({ where: { id: partnerId } });
  if (!partner) return res.status(404).json({ message: "Delivery partner not found" });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      deliveryPartnerId: partnerId,
      status: order.status === "Placed" || order.status === "Confirmed" ? "Assigned" : order.status,
      statusHistory: appendStatus(order.statusHistory, {
        status: "Assigned",
        note: `Assigned to ${partner.name}`,
      }),
    },
    include: { deliveryPartner: true },
  });
  res.json({ order: updated });
});

/* ── Delivery partner management ────────────────────────────────────────── */

const partnerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  vehicleType: true,
  isActive: true,
  createdAt: true,
} as const;

/** GET /api/admin/partners */
export const getPartners = asyncHandler(async (_req, res) => {
  const partners = await prisma.deliveryPartner.findMany({
    orderBy: { createdAt: "desc" },
    select: partnerSelect,
  });
  res.json({ partners });
});

/** POST /api/admin/partners */
export const createPartner = asyncHandler(async (req, res) => {
  const { name, email, phone, password, vehicleType } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "Name, email, phone and password are required" });
  }
  const existing = await prisma.deliveryPartner.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const partner = await prisma.deliveryPartner.create({
    data: { name, email, phone, password: hashed, vehicleType: vehicleType || "bike" },
    select: partnerSelect,
  });
  res.status(201).json({ partner });
});

/** PUT /api/admin/partners/:id */
export const updatePartner = asyncHandler(async (req, res) => {
  const existing = await prisma.deliveryPartner.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Partner not found" });

  const data: Record<string, unknown> = {
    name: req.body.name ?? existing.name,
    phone: req.body.phone ?? existing.phone,
    vehicleType: req.body.vehicleType ?? existing.vehicleType,
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : existing.isActive,
  };
  if (req.body.password) data.password = await bcrypt.hash(req.body.password, 10);

  const partner = await prisma.deliveryPartner.update({
    where: { id: req.params.id },
    data,
    select: partnerSelect,
  });
  res.json({ partner });
});

/** DELETE /api/admin/partners/:id */
export const deletePartner = asyncHandler(async (req, res) => {
  const existing = await prisma.deliveryPartner.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Partner not found" });
  await prisma.deliveryPartner.delete({ where: { id: req.params.id } });
  res.json({ message: "Partner removed" });
});
