import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../types";
import { getProducts } from "../services/products";
import { productImage } from "../utils/image";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

/** Attach a display-ready image (falls back to bundled artwork by name). */
function withImage(p: Product): Product {
  return { ...p, image: productImage(p.image, p.name) };
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getProducts();
      setProducts(list.map(withImage));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const value = useMemo<ProductsContextValue>(
    () => ({ products, loading, error, refresh }),
    [products, loading, error, refresh]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within a ProductsProvider");
  return ctx;
}
