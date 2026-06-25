import { useState, type FormEvent } from "react";
import { CreditCardIcon, LockIcon } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Created once at module load — loadStripe must not be called on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentProps {
    clientSecret: string;
    total: number;
    onSuccess: () => void;
}

function PaymentForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setSubmitting(true);
        setError(null);

        // redirect: "if_required" keeps card payments inline; only methods that
        // genuinely need a redirect (e.g. some wallets) will navigate away.
        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (stripeError) {
            setError(stripeError.message || "Payment failed. Please try again.");
            setSubmitting(false);
            return;
        }

        if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
            onSuccess();
            return;
        }

        setError("Payment was not completed. Please try again.");
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <PaymentElement />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                type="submit"
                disabled={!stripe || submitting}
                className="w-full py-3 bg-app-orange text-white font-semibold rounded-xl hover:bg-app-orange-dark transition-colors disabled:opacity-60 active:scale-[0.98]"
            >
                {submitting ? "Processing..." : `Pay ${currency}${total.toFixed(2)}`}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-app-text-light">
                <LockIcon className="size-3" /> Payments are secured by Stripe
            </p>
        </form>
    );
}

export default function StripePayment({ clientSecret, total, onSuccess }: StripePaymentProps) {
    return (
        <div className="bg-white rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-app-green mb-5 flex items-center gap-2">
                <CreditCardIcon className="size-5" /> Card Payment
            </h2>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                <PaymentForm total={total} onSuccess={onSuccess} />
            </Elements>
        </div>
    );
}
