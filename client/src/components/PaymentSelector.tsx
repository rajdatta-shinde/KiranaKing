import { BanknoteIcon, CreditCardIcon } from "lucide-react";

export type PaymentMethod = "card" | "cash";

const methods: { value: PaymentMethod; label: string; desc: string; icon: typeof CreditCardIcon }[] = [
  { value: "card", label: "Credit / Debit Card", desc: "Pay securely online with Stripe", icon: CreditCardIcon },
  { value: "cash", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: BanknoteIcon },
];

export default function PaymentSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}) {
  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const Icon = method.icon;
        const active = value === method.value;
        return (
          <label
            key={method.value}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              active ? "border-app-green bg-app-cream" : "border-app-border hover:border-app-green-lighter"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value={method.value}
              checked={active}
              onChange={() => onChange(method.value)}
              className="size-4 accent-app-green"
            />
            <span className={`size-9 rounded-lg flex-center ${active ? "bg-app-green text-white" : "bg-app-cream-dark text-app-text-light"}`}>
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-app-green">{method.label}</p>
              <p className="text-xs text-app-text-light">{method.desc}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
