import { api } from "./api";

/** Create a Stripe PaymentIntent for an existing order; returns the client secret. */
export async function createPaymentIntent(orderId: string): Promise<string> {
  const { clientSecret } = await api.post<{ clientSecret: string }>("/payments/create-intent", {
    orderId,
  });
  return clientSecret;
}
