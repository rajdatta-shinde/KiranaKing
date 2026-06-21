import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import type { CartItem, Product } from "../types";

interface CartTotals {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
  totals: CartTotals;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "kk_cart";
const FREE_DELIVERY_THRESHOLD = 35;
const DELIVERY_FEE = 2.99;
const TAX_RATE = 0.07;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue["addItem"] = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: nextQty } : i
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
    toast.success(`${product.name} added to cart`);
    setIsOpen(true);
  };

  const removeItem: CartContextValue["removeItem"] = (productId) =>
    setItems((prev) => prev.filter((i) => i.product._id !== productId));

  const setQuantity: CartContextValue["setQuantity"] = (productId, quantity) =>
    setItems((prev) =>
      prev
        .map((i) =>
          i.product._id === productId
            ? { ...i, quantity: Math.max(0, Math.min(quantity, i.product.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );

  const increment: CartContextValue["increment"] = (productId) =>
    setItems((prev) =>
      prev.map((i) =>
        i.product._id === productId
          ? { ...i, quantity: Math.min(i.quantity + 1, i.product.stock) }
          : i
      )
    );

  const decrement: CartContextValue["decrement"] = (productId) =>
    setItems((prev) =>
      prev
        .map((i) =>
          i.product._id === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );

  const clearCart = () => setItems([]);

  const getQuantity = (productId: string) =>
    items.find((i) => i.product._id === productId)?.quantity ?? 0;

  const totals = useMemo<CartTotals>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const tax = +(subtotal * TAX_RATE).toFixed(2);
    return {
      itemCount,
      subtotal: +subtotal.toFixed(2),
      deliveryFee,
      tax,
      total: +(subtotal + deliveryFee + tax).toFixed(2),
    };
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((p) => !p),
      addItem,
      removeItem,
      increment,
      decrement,
      setQuantity,
      clearCart,
      getQuantity,
      totals,
    }),
    [items, isOpen, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export { FREE_DELIVERY_THRESHOLD };
