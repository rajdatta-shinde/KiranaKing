import { api, setToken } from "./api";
import type { Address, User, UserRole } from "../types";

interface RawUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isAdmin?: boolean;
  addresses?: Address[];
  createdAt: string;
  updatedAt?: string;
}

interface RawPartner {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  vehicleType?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Map an API user payload into the frontend `User` shape (role from isAdmin). */
export function mapUser(u: RawUser): User {
  const role: UserRole = u.isAdmin ? "admin" : "customer";
  return {
    _id: u.id ?? u._id ?? "",
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    avatar: u.avatar ?? "",
    addresses: u.addresses ?? [],
    role,
    isAdmin: !!u.isAdmin,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt ?? u.createdAt,
  };
}

/** Map a delivery-partner payload into a `User` with the "delivery" role. */
export function mapPartnerToUser(p: RawPartner): User {
  return {
    _id: p.id ?? p._id ?? "",
    name: p.name,
    email: p.email,
    phone: p.phone ?? "",
    avatar: p.avatar ?? "",
    addresses: [],
    role: "delivery",
    isAdmin: false,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt ?? p.createdAt,
  };
}

export async function login(email: string, password: string): Promise<User> {
  const { user, token } = await api.post<{ user: RawUser; token: string }>("/auth/login", {
    email,
    password,
  });
  setToken(token);
  return mapUser(user);
}

export async function loginAdmin(email: string, password: string): Promise<User> {
  const { user, token } = await api.post<{ user: RawUser; token: string }>("/auth/admin/login", {
    email,
    password,
  });
  setToken(token);
  return mapUser(user);
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const { user, token } = await api.post<{ user: RawUser; token: string }>("/auth/register", {
    name,
    email,
    password,
  });
  setToken(token);
  return mapUser(user);
}

export async function loginPartner(email: string, password: string): Promise<User> {
  const { partner, token } = await api.post<{ partner: RawPartner; token: string }>(
    "/delivery/login",
    { email, password }
  );
  setToken(token);
  return mapPartnerToUser(partner);
}

export async function fetchMe(): Promise<User> {
  const { user } = await api.get<{ user: RawUser }>("/auth/me");
  return mapUser(user);
}

export async function fetchPartnerMe(): Promise<User> {
  const { partner } = await api.get<{ partner: RawPartner }>("/delivery/me");
  return mapPartnerToUser(partner);
}

export async function logout(role: UserRole): Promise<void> {
  const path = role === "delivery" ? "/delivery/logout" : "/auth/logout";
  try {
    await api.post(path);
  } finally {
    setToken(null);
  }
}
