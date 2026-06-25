import { api } from "./api";
import type { Product } from "../types";

export interface ProductQuery {
  category?: string;
  search?: string;
  organic?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
}

function toQueryString(query: ProductQuery = {}): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.search) params.set("search", query.search);
  if (query.organic) params.set("organic", "true");
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.sort) params.set("sort", query.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getProducts(query?: ProductQuery): Promise<Product[]> {
  const { products } = await api.get<{ products: Product[] }>(`/products${toQueryString(query)}`);
  return products;
}

export async function getProduct(id: string): Promise<Product> {
  const { product } = await api.get<{ product: Product }>(`/products/${id}`);
  return product;
}

/** Create a product (admin). Accepts a FormData with optional `image` file. */
export async function createProduct(data: FormData): Promise<Product> {
  const { product } = await api.postForm<{ product: Product }>("/products", data);
  return product;
}

export async function updateProduct(id: string, data: FormData): Promise<Product> {
  const { product } = await api.putForm<{ product: Product }>(`/products/${id}`, data);
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.del(`/products/${id}`);
}
