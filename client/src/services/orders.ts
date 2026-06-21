import type { CartItem, Order } from "../types";
import { dummyMyOrders } from "../assets/assets";

/**
 * Phase 1 order store. Orders the user places this session are kept in
 * localStorage and merged ahead of the seeded demo orders so My Orders and
 * the tracking page show a consistent list. In Phase 2 each function becomes
 * a call to the REST API while keeping these signatures.
 */
const STORAGE_KEY = "kk_orders";

function readLocal(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getOrders(): Order[] {
  return [...readLocal(), ...dummyMyOrders];
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o._id === id);
}

interface PlaceOrderInput {
  items: CartItem[];
  shippingAddress: Order["shippingAddress"];
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

function genOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function placeOrder(input: PlaceOrderInput): Order {
  const now = new Date().toISOString();
  const order: Order = {
    _id: `ord_${Date.now()}`,
    user: { _id: "usr_me", name: "You", email: "" },
    items: input.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      image: i.product.image,
      price: i.product.price,
      quantity: i.quantity,
      unit: i.product.unit,
    })),
    shippingAddress: input.shippingAddress,
    paymentMethod: input.paymentMethod,
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    tax: input.tax,
    total: input.total,
    status: "Placed",
    statusHistory: [{ status: "Placed", timestamp: now, note: "Order placed" }],
    deliveryPartner: null,
    deliveryOtp: genOtp(),
    isPaid: input.paymentMethod === "card",
    createdAt: now,
  };
  writeLocal([order, ...readLocal()]);
  return order;
}

export function cancelOrder(id: string): void {
  const local = readLocal().map((o) =>
    o._id === id
      ? {
          ...o,
          status: "Cancelled",
          statusHistory: [
            ...o.statusHistory,
            { status: "Cancelled", timestamp: new Date().toISOString(), note: "Cancelled by customer" },
          ],
        }
      : o
  );
  writeLocal(local);
}
