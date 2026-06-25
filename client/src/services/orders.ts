import { api } from "./api";
import type { CartItem, Order } from "../types";

export interface PlaceOrderInput {
  items: CartItem[];
  shippingAddress: Order["shippingAddress"];
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

/** Current user's orders, newest first. */
export async function getOrders(): Promise<Order[]> {
  const { orders } = await api.get<{ orders: Order[] }>("/orders/my");
  return orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const { order } = await api.get<{ order: Order }>(`/orders/${id}`);
    return order;
  } catch {
    return null;
  }
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const payload = {
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
  };
  const { order } = await api.post<{ order: Order }>("/orders", payload);
  return order;
}

export async function cancelOrder(id: string): Promise<Order> {
  const { order } = await api.patch<{ order: Order }>(`/orders/${id}/cancel`);
  return order;
}

/** Customer polls the assigned partner's live GPS location. */
export async function getLiveLocation(id: string): Promise<{ lat: number; lng: number } | null> {
  const { liveLocation } = await api.get<{ liveLocation: { lat: number; lng: number } | null }>(
    `/orders/${id}/location`
  );
  return liveLocation;
}
