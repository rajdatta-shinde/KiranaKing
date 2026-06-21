import Stripe from "stripe";
import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../middleware/error";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

/**
 * POST /api/payments/create-intent
 * Creates a PaymentIntent for an existing order and returns the client secret.
 */
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body as { orderId?: string };
  if (!orderId) return res.status(400).json({ message: "orderId is required" });

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.userId },
  });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.isPaid) return res.status(400).json({ message: "Order already paid" });

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // cents
    currency: "usd",
    metadata: { orderId: order.id, userId: req.userId! },
    automatic_payment_methods: { enabled: true },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentIntentId: intent.id },
  });

  res.json({ clientSecret: intent.client_secret });
});

/**
 * POST /api/payments/webhook
 * Stripe webhook — must receive the raw body (configured in index.ts).
 */
export async function stripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, secret as string);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.orderId;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { isPaid: true },
      }).catch(() => undefined);
    }
  }

  res.json({ received: true });
}
