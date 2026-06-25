import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../services/orders";
import { createPaymentIntent } from "../services/payments";
import { formatPrice } from "../utils/format";
import type { Address } from "../types";
import CheckoutAddress from "../components/Checkout/CheckoutAddress";
import CheckoutPayment from "../components/Checkout/CheckoutPayment";
import CheckoutReview from "../components/Checkout/CheckoutReview";
import StripePayment from "../components/Checkout/StripePayment";

type Step = "address" | "payment" | "review";
const steps: { key: Step; label: string }[] = [
  { key: "address", label: "Address" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

const emptyAddress = { label: "", address: "", city: "", state: "", zip: "", lat: 0, lng: 0 };

export default function Checkout() {
  const { user } = useAuth();
  const { items, totals, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  // Set once a card order is placed and a PaymentIntent exists — switches the
  // left column to the Stripe card form.
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-lg font-semibold text-app-green">Your cart is empty</p>
        <Link to="/products" className="mt-3 inline-block text-app-orange font-medium">
          ← Continue shopping
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const order = await placeOrder({
        items,
        shippingAddress: address,
        paymentMethod: paymentMethod === "card" ? "card" : "cod",
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        tax: totals.tax,
        total: totals.total,
      });

      if (paymentMethod === "card") {
        // Order exists but is unpaid — collect payment with the Stripe form.
        const secret = await createPaymentIntent(order._id);
        setPlacedOrderId(order._id);
        setClientSecret(secret);
        scrollTo(0, 0);
        return;
      }

      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${order._id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    toast.success("Payment successful! Order placed.");
    navigate(`/orders/${placedOrderId}`);
  };

  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-app-green mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`size-8 rounded-full flex-center text-sm font-semibold ${
                  i <= activeIndex ? "bg-app-green text-white" : "bg-app-cream-dark text-app-text-light"
                }`}
              >
                {i < activeIndex ? <CheckIcon className="size-4" /> : i + 1}
              </span>
              <span className={`text-sm font-medium ${i <= activeIndex ? "text-app-green" : "text-app-text-light"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < activeIndex ? "bg-app-green" : "bg-app-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {clientSecret ? (
            <StripePayment clientSecret={clientSecret} total={totals.total} onSuccess={handlePaymentSuccess} />
          ) : (
            <>
              {step === "address" && (
                <CheckoutAddress user={user} address={address} setAddress={setAddress} setStep={setStep} />
              )}
              {step === "payment" && (
                <CheckoutPayment setStep={setStep} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
              )}
              {step === "review" && (
                <CheckoutReview
                  address={address as unknown as Address}
                  items={items}
                  handlePlaceOrder={handlePlaceOrder}
                  loading={loading}
                  total={totals.total}
                />
              )}
            </>
          )}
        </div>

        {/* Order summary */}
        <aside className="bg-white rounded-2xl border border-app-border p-6 h-fit">
          <h2 className="font-semibold text-app-green mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-app-text-light">
              <span>Subtotal ({totals.itemCount} items)</span>
              <span className="text-app-text font-medium">{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-app-text-light">
              <span>Delivery</span>
              <span className="text-app-text font-medium">
                {totals.deliveryFee === 0 ? "Free" : formatPrice(totals.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-app-text-light">
              <span>Tax</span>
              <span className="text-app-text font-medium">{formatPrice(totals.tax)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-app-border font-semibold text-app-green text-base">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
