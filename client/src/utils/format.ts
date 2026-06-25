export const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

/** Format a number as a price string, e.g. `$3.49`. */
export const formatPrice = (value: number): string => `${currency}${value.toFixed(2)}`;

/** Short, human-readable date, e.g. `Jun 20, 2026`. */
export const formatDate = (input: string | Date): string =>
  new Date(input).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/** Date + time, e.g. `Jun 20, 2:15 PM`. */
export const formatDateTime = (input: string | Date): string =>
  new Date(input).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Human-facing order number, e.g. `402-260625-000042`. Prefers the stored
 * `orderNumber`; falls back to a short id ref for legacy orders created before
 * order numbers existed.
 */
export const orderRef = (order: { orderNumber?: string | null; _id: string }): string =>
  order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`;
