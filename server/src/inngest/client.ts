import { Inngest } from "inngest";

/** Event-driven background jobs (low-stock alerts, offers, rider assignment). */
export const inngest = new Inngest({ id: "kiranaking" });

/* Event name constants so producers and consumers stay in sync. */
export const EVENTS = {
  STOCK_UPDATED: "product/stock.updated",
  ORDER_PLACED: "order/placed",
} as const;
