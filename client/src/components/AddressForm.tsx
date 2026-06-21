import { useState, type FormEvent } from "react";
import type { Address } from "../types";

export type AddressFormValues = Omit<Address, "_id">;

const empty: AddressFormValues = {
  label: "Home",
  address: "",
  city: "",
  state: "",
  zip: "",
  isDefault: false,
  lat: 0,
  lng: 0,
};

const fields: { name: keyof AddressFormValues; label: string; placeholder: string; half?: boolean }[] = [
  { name: "label", label: "Label (e.g. Home, Work)", placeholder: "Home" },
  { name: "address", label: "Street Address", placeholder: "742 Maple Avenue, Apt 5" },
  { name: "city", label: "City", placeholder: "Springfield", half: true },
  { name: "state", label: "State", placeholder: "IL", half: true },
  { name: "zip", label: "Postal Code", placeholder: "62704", half: true },
];

interface AddressFormProps {
  initial?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  onCancel?: () => void;
  submitting?: boolean;
  /** Captured separately from street address per the spec's address schema. */
  withContact?: boolean;
}

export default function AddressForm({ initial, onSubmit, onCancel, submitting }: AddressFormProps) {
  const [values, setValues] = useState<AddressFormValues>({ ...empty, ...initial });

  const handleChange = (name: keyof AddressFormValues, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Lightweight geocode stand-in so the map has coordinates in Phase 1.
    const lat = values.lat || 39.78 + (Math.random() - 0.5) * 0.05;
    const lng = values.lng || -89.65 + (Math.random() - 0.5) * 0.05;
    onSubmit({ ...values, lat, lng });
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-app-border focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className={field.half ? "" : "col-span-2"}>
            <label className="block text-sm font-medium text-app-green mb-1.5">{field.label}</label>
            <input
              required
              type="text"
              value={String(values[field.name] ?? "")}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-app-text">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(e) => handleChange("isDefault", e.target.checked)}
          className="size-4 accent-app-green"
        />
        Set as default address
      </label>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium text-app-text-light bg-app-cream-dark rounded-xl hover:bg-app-border transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-app-green rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save Address"}
        </button>
      </div>
    </form>
  );
}
