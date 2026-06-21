import { useNavigate } from "react-router-dom";
import { MinusIcon, PlusIcon, ShoppingCartIcon, Trash2Icon, XIcon } from "lucide-react";
import { useCart, FREE_DELIVERY_THRESHOLD } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";

export default function CartSidebar() {
  const { items, isOpen, closeCart, increment, decrement, removeItem, totals } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate(user ? "/checkout" : "/login?redirect=/checkout");
  };

  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - totals.subtotal);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-app-cream z-50 flex flex-col shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-app-border">
          <h2 className="text-lg font-semibold text-app-green flex items-center gap-2">
            <ShoppingCartIcon className="size-5" /> Your Cart ({totals.itemCount})
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-app-cream rounded-lg" aria-label="Close cart">
            <XIcon className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex-center flex-col gap-3 text-center px-6">
            <div className="size-16 rounded-full bg-white flex-center">
              <ShoppingCartIcon className="size-7 text-app-text-light" />
            </div>
            <p className="font-semibold text-app-green">Your cart is empty</p>
            <p className="text-sm text-app-text-light">Add some fresh groceries to get started.</p>
            <button onClick={closeCart} className="mt-2 px-5 py-2.5 bg-app-green text-white text-sm font-semibold rounded-xl hover:bg-app-green-light transition-colors">
              Start shopping
            </button>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            {remainingForFreeDelivery > 0 && (
              <div className="px-5 py-3 bg-orange-50 text-xs text-app-orange-dark font-medium">
                Add {formatPrice(remainingForFreeDelivery)} more for free delivery 🚚
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => (
                <div key={item.product._id} className="flex gap-3 bg-white rounded-xl p-3 border border-app-border">
                  <img src={item.product.image} alt={item.product.name} className="size-16 rounded-lg object-contain bg-app-cream p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-app-text line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-app-text-light">{item.product.unit}</p>
                    <p className="text-sm font-semibold text-app-green mt-1">{formatPrice(item.product.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item.product._id)} className="p-1 text-app-text-light hover:text-app-error" aria-label="Remove item">
                      <Trash2Icon className="size-4" />
                    </button>
                    <div className="flex items-center gap-1.5 bg-app-green text-white rounded-lg px-1">
                      <button onClick={() => decrement(item.product._id)} className="p-1 hover:bg-white/10 rounded" aria-label="Decrease">
                        <MinusIcon className="size-3.5" />
                      </button>
                      <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => increment(item.product._id)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 hover:bg-white/10 rounded disabled:opacity-40"
                        aria-label="Increase"
                      >
                        <PlusIcon className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / totals */}
            <div className="bg-white border-t border-app-border px-5 py-4 space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-app-text-light">
                  <span>Subtotal</span>
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
                <div className="flex justify-between pt-2 border-t border-app-border text-base font-semibold text-app-green">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-app-orange text-white font-semibold rounded-xl hover:bg-app-orange-dark transition-colors active:scale-[0.99]"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
