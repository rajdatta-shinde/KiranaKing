import { api } from "./api";
import type { Address } from "../types";

export type AddressInput = Omit<Address, "_id">;

export async function getAddresses(): Promise<Address[]> {
  const { addresses } = await api.get<{ addresses: Address[] }>("/addresses");
  return addresses;
}

export async function addAddress(data: AddressInput): Promise<Address> {
  const { address } = await api.post<{ address: Address }>("/addresses", data);
  return address;
}

export async function updateAddress(id: string, data: Partial<AddressInput>): Promise<Address> {
  const { address } = await api.put<{ address: Address }>(`/addresses/${id}`, data);
  return address;
}

export async function deleteAddress(id: string): Promise<void> {
  await api.del(`/addresses/${id}`);
}
