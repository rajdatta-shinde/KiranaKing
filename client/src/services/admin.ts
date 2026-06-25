import { api } from "./api";
import type { DeliveryPartner, Order } from "../types";

export interface DashboardData {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  outOfStock: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export async function getDashboard(): Promise<DashboardData> {
  return api.get<DashboardData>("/admin/dashboard");
}

export async function getAllOrders(): Promise<Order[]> {
  const { orders } = await api.get<{ orders: Order[] }>("/admin/orders");
  return orders;
}

/** Admin advances an order's status. */
export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const { order } = await api.patch<{ order: Order }>(`/orders/${id}/status`, { status });
  return order;
}

export async function assignPartner(orderId: string, partnerId: string): Promise<Order> {
  const { order } = await api.patch<{ order: Order }>(`/admin/orders/${orderId}/assign`, {
    partnerId,
  });
  return order;
}

export interface PartnerInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleType: string;
}

export async function getPartners(): Promise<DeliveryPartner[]> {
  const { partners } = await api.get<{ partners: DeliveryPartner[] }>("/admin/partners");
  return partners;
}

export async function createPartner(data: PartnerInput): Promise<DeliveryPartner> {
  const { partner } = await api.post<{ partner: DeliveryPartner }>("/admin/partners", data);
  return partner;
}

export async function updatePartner(
  id: string,
  data: Partial<PartnerInput & { isActive: boolean }>
): Promise<DeliveryPartner> {
  const { partner } = await api.put<{ partner: DeliveryPartner }>(`/admin/partners/${id}`, data);
  return partner;
}

export async function deletePartner(id: string): Promise<void> {
  await api.del(`/admin/partners/${id}`);
}
