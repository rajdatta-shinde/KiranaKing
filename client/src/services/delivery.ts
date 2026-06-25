import { api } from "./api";
import type { Order } from "../types";

/** Orders assigned to the logged-in delivery partner. */
export async function getAssignedOrders(): Promise<Order[]> {
  const { orders } = await api.get<{ orders: Order[] }>("/delivery/orders");
  return orders;
}

/** Partner advances the status of one of their assigned orders. */
export async function updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
  const { order } = await api.patch<{ order: Order }>(`/orders/${id}/partner-status`, {
    status,
    note,
  });
  return order;
}

export async function verifyDeliveryOtp(id: string, otp: string): Promise<Order> {
  const { order } = await api.post<{ order: Order }>(`/orders/${id}/verify-otp`, { otp });
  return order;
}

export async function updateLiveLocation(id: string, lat: number, lng: number): Promise<void> {
  await api.patch(`/orders/${id}/location`, { lat, lng });
}
