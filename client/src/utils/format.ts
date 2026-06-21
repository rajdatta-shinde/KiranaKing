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

/** Short order reference derived from an id, e.g. `#1A2B3C`. */
export const orderRef = (id: string): string => `#${id.slice(-6).toUpperCase()}`;
