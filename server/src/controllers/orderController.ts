import prisma from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { inngest, EVENTS } from "../inngest/client";
import { appendStatus } from "../lib/orderStatus";

interface IncomingItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
}

function genOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Build a human-friendly, Amazon-style order number from the order's sequence
 * number and creation date — e.g. `402-260625-000042`.
 *   402     fixed store/marketplace code
 *   260625  order date (YYMMDD, UTC)
 *   000042  zero-padded monotonic sequence (guarantees uniqueness)
 * Deterministic and sortable — no random digits.
 */
function formatOrderNumber(seq: number, createdAt: Date): string {
  const yy = String(createdAt.getUTCFullYear()).slice(-2);
  const mm = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(createdAt.getUTCDate()).padStart(2, "0");
  return `402-${yy}${mm}${dd}-${String(seq).padStart(6, "0")}`;
}

/** POST /api/orders — create an order, decrement stock, kick off rider assignment. */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, subtotal, deliveryFee, tax, total } =
    req.body as {
      items: IncomingItem[];
      shippingAddress: unknown;
      paymentMethod: string;
      subtotal: number;
      deliveryFee: number;
      tax: number;
      total: number;
    };

  if (!items?.length) return res.status(400).json({ message: "Cart is empty" });
  if (!shippingAddress) return res.status(400).json({ message: "Shipping address is required" });

  // Validate stock before committing.
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.product } });
    if (!product) return res.status(404).json({ message: `Product not found: ${item.name}` });
    if ((product.stock ?? 0) < item.quantity) {
      return res.status(400).json({ message: `Not enough stock for ${product.name}` });
    }
  }

  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      items: items as unknown as object,
      shippingAddress: shippingAddress as object,
      paymentMethod: paymentMethod || "card",
      subtotal,
      deliveryFee,
      tax,
      total,
      status: "Placed",
      statusHistory: appendStatus([], { status: "Placed", note: "Order placed" }),
      deliveryOtp: genOtp(),
      // Orders start unpaid. Card orders are marked paid by the Stripe webhook
      // (payment_intent.succeeded); COD orders are marked paid on delivery.
      isPaid: false,
    },
  });

  // Now that the DB has assigned orderSeq, derive the display number from it.
  const numbered = await prisma.order.update({
    where: { id: order.id },
    data: { orderNumber: formatOrderNumber(order.orderSeq, order.createdAt) },
  });

  // Decrement stock and flag any product that drops low.
  for (const item of items) {
    const updated = await prisma.product.update({
      where: { id: item.product },
      data: { stock: { decrement: item.quantity } },
    });
    if ((updated.stock ?? 0) < 10) {
      await inngest.send({ name: EVENTS.STOCK_UPDATED, data: { productId: updated.id } });
    }
  }

  await inngest.send({ name: EVENTS.ORDER_PLACED, data: { orderId: order.id } });

  res.status(201).json({ order: numbered });
});

/** GET /api/orders/my — current user's orders. */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    include: { deliveryPartner: true },
  });
  res.json({ orders });
});

/** GET /api/orders/:id — owner or admin (admin enforced at route level for /admin). */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { deliveryPartner: true },
  });
  if (!order) return res.status(404).json({ message: "Order not found" });

  const isOwner = order.userId === req.userId;
  const isAdmin =
    !!req.userEmail &&
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .includes(req.userEmail.toLowerCase());

  if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });
  res.json({ order });
});

/** PATCH /api/orders/:id/cancel — owner cancels a not-yet-shipped order. */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (["Out for Delivery", "Delivered", "Cancelled"].includes(order.status)) {
    return res.status(400).json({ message: `Cannot cancel a ${order.status} order` });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "Cancelled",
      statusHistory: appendStatus(order.statusHistory, {
        status: "Cancelled",
        note: "Cancelled by customer",
      }),
    },
  });
  res.json({ order: updated });
});

/** PATCH /api/orders/:id/status — admin or assigned partner advances status. */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body as { status?: string; note?: string };
  if (!status) return res.status(400).json({ message: "Status is required" });

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ message: "Order not found" });

  // Partners may only update their own assigned orders.
  if (req.partnerId && order.deliveryPartnerId !== req.partnerId) {
    return res.status(403).json({ message: "Not your assigned order" });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status,
      ...(status === "Delivered" ? { isPaid: true } : {}),
      statusHistory: appendStatus(order.statusHistory, {
        status,
        note: note || `Marked ${status}`,
      }),
    },
  });
  res.json({ order: updated });
});

/** POST /api/orders/:id/verify-otp — partner verifies OTP to complete delivery. */
export const verifyDeliveryOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body as { otp?: string };
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.deliveryPartnerId !== req.partnerId) {
    return res.status(403).json({ message: "Not your assigned order" });
  }
  if (!otp || otp !== order.deliveryOtp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "Delivered",
      isPaid: true,
      statusHistory: appendStatus(order.statusHistory, {
        status: "Delivered",
        note: "Delivered (OTP verified)",
      }),
    },
  });
  res.json({ order: updated });
});

/** PATCH /api/orders/:id/location — partner pushes live GPS coords. */
export const updateLiveLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body as { lat?: number; lng?: number };
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ message: "lat and lng are required" });
  }
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.deliveryPartnerId !== req.partnerId) {
    return res.status(403).json({ message: "Not your assigned order" });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { liveLocation: { lat, lng, updatedAt: new Date().toISOString() } },
  });
  res.json({ message: "Location updated" });
});

/** GET /api/orders/:id/location — owner polls the live location. */
export const getLiveLocation = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    select: { userId: true, liveLocation: true },
  });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.userId !== req.userId) return res.status(403).json({ message: "Forbidden" });
  res.json({ liveLocation: order.liveLocation ?? null });
});
