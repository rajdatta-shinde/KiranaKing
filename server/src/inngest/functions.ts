import { inngest, EVENTS } from "./client";
import prisma from "../lib/prisma";
import { sendEmail } from "../lib/mailer";
import { lowStockEmail, monthlyOfferEmail } from "../lib/emailTemplates";
import { appendStatus } from "../lib/orderStatus";

const LOW_STOCK_THRESHOLD = 10;
const AUTO_ASSIGN_DELAY = "5m";

function adminEmail(): string {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)[0];
}

/* ── 1. Low-stock alert ─────────────────────────────────────────────────────
   Fired when a product's stock is updated; emails admin if it dips below 10. */
export const lowStockAlert = inngest.createFunction(
  { id: "low-stock-alert" },
  { event: EVENTS.STOCK_UPDATED },
  async ({ event, step }) => {
    const productId = event.data.productId as string;

    const product = await step.run("fetch-product", () =>
      prisma.product.findUnique({ where: { id: productId } })
    );

    if (!product || (product.stock ?? 0) >= LOW_STOCK_THRESHOLD) {
      return { skipped: true };
    }

    const to = adminEmail();
    if (!to) return { skipped: true, reason: "no admin email configured" };

    await step.run("send-low-stock-email", () =>
      sendEmail({
        to,
        subject: `Low stock: ${product.name} (${product.stock} left)`,
        html: lowStockEmail({
          name: product.name,
          image: product.image,
          category: product.category,
          unit: product.unit,
          stock: product.stock ?? 0,
        }),
      })
    );

    return { emailed: to, product: product.name };
  }
);

/* ── 2. Monthly offers ──────────────────────────────────────────────────────
   Cron at 09:00 on the 1st of each month: emails everyone the top deals. */
export const monthlyOffers = inngest.createFunction(
  { id: "monthly-offers" },
  { cron: "0 9 1 * *" },
  async ({ step }) => {
    const deals = await step.run("fetch-top-deals", () =>
      prisma.product.findMany({
        where: { discount: { gt: 0 } },
        orderBy: { discount: "desc" },
        take: 9,
      })
    );

    if (deals.length === 0) return { skipped: true, reason: "no deals" };

    const users = await step.run("fetch-users", () =>
      prisma.user.findMany({ select: { name: true, email: true } })
    );

    const offerProducts = deals.map((p) => ({
      name: p.name,
      image: p.image,
      price: p.price,
      originalPrice: p.originalPrice ?? p.price,
    }));

    let sent = 0;
    for (const user of users) {
      await step.run(`offer-email-${user.email}`, async () => {
        await sendEmail({
          to: user.email,
          subject: "Fresh picks just for you 🥦",
          html: monthlyOfferEmail({ name: user.name }, offerProducts),
        });
        return true;
      });
      sent++;
    }

    return { sent };
  }
);

/* ── 3. Auto-assign rider ───────────────────────────────────────────────────
   On order placement, wait 5 min; if no partner was assigned manually,
   assign the first active delivery partner. */
export const autoAssignRider = inngest.createFunction(
  { id: "auto-assign-rider" },
  { event: EVENTS.ORDER_PLACED },
  async ({ event, step }) => {
    const orderId = event.data.orderId as string;

    await step.sleep("wait-for-manual-assignment", AUTO_ASSIGN_DELAY);

    const order = await step.run("fetch-order", () =>
      prisma.order.findUnique({ where: { id: orderId } })
    );

    if (!order || order.deliveryPartnerId || order.status === "Cancelled") {
      return { skipped: true };
    }

    const partner = await step.run("find-available-partner", () =>
      prisma.deliveryPartner.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      })
    );

    if (!partner) return { skipped: true, reason: "no active partner" };

    await step.run("assign-partner", () =>
      prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryPartnerId: partner.id,
          status: "Assigned",
          statusHistory: appendStatus(order.statusHistory, {
            status: "Assigned",
            note: "Auto-assigned rider",
          }),
        },
      })
    );

    return { assigned: partner.name, orderId };
  }
);

export const functions = [lowStockAlert, monthlyOffers, autoAssignRider];
