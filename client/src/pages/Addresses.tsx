import { useEffect, useState } from "react";
import { MapPinIcon, PlusIcon, PencilIcon, Trash2Icon, StarIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AddressForm, { type AddressFormValues } from "../components/AddressForm";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../services/addresses";
import type { Address } from "../types";

export default function Addresses() {
  const { updateAddresses } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Keep both this page and the auth context (used at checkout) in sync.
  const sync = (list: Address[]) => {
    setAddresses(list);
    updateAddresses(list);
  };

  const reload = async () => {
    try {
      sync(await getAddresses());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load addresses");
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setShowForm(true);
  };

  const handleSubmit = async (values: AddressFormValues) => {
    setSaving(true);
    try {
      if (editing) await updateAddress(editing._id, values);
      else await addAddress(values);
      await reload();
      setShowForm(false);
      setEditing(null);
      toast.success(editing ? "Address updated" : "Address added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      await reload();
      toast.success("Address removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete address");
    }
  };

  const setDefault = async (id: string) => {
    try {
      await updateAddress(id, { isDefault: true });
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update address");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-app-green">My Addresses</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-app-green text-white text-sm font-semibold rounded-xl hover:bg-app-green-light transition-colors"
        >
          <PlusIcon className="size-4" /> Add Address
        </button>
      </div>

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
          <MapPinIcon className="size-12 text-app-border mx-auto mb-3" />
          <p className="font-semibold text-app-green">No saved addresses</p>
          <p className="text-sm text-app-text-light mt-1">Add an address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-white rounded-2xl border border-app-border p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="size-4 text-app-green" />
                  <span className="font-semibold text-app-text">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-semibold text-app-orange uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(addr)} className="p-1.5 text-app-text-light hover:text-app-green rounded-lg hover:bg-app-cream" aria-label="Edit">
                    <PencilIcon className="size-4" />
                  </button>
                  <button onClick={() => handleDelete(addr._id)} className="p-1.5 text-app-text-light hover:text-app-error rounded-lg hover:bg-red-50" aria-label="Delete">
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-app-text-light mt-2">{addr.address}</p>
              <p className="text-sm text-app-text-light">{addr.city}, {addr.state} {addr.zip}</p>
              {!addr.isDefault && (
                <button onClick={() => setDefault(addr._id)} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-app-green hover:text-app-green-light">
                  <StarIcon className="size-3.5" /> Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowForm(false)} />
          <div className="fixed inset-0 z-50 flex-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-app-green mb-4">
                {editing ? "Edit Address" : "New Address"}
              </h2>
              <AddressForm
                initial={editing ?? undefined}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                submitting={saving}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
