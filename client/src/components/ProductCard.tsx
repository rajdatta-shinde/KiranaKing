import { Link } from "react-router-dom";
import { MinusIcon, PlusIcon, StarIcon, LeafIcon } from "lucide-react";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function ProductCard({ product }: { product: Product }) {
  const { getQuantity, addItem, increment, decrement } = useCart();
  const quantity = getQuantity(product._id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-app-border overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link to={`/products/${product._id}`} className="relative block aspect-square bg-app-cream p-4">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
        />
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-app-orange text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {product.discount}% OFF
          </span>
        )}
        {product.isOrganic && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <LeafIcon className="size-3" /> Organic
          </span>
        )}
      </Link>

      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-xs text-app-text-light mb-1">
          <StarIcon className="size-3.5 text-app-warning fill-app-warning" />
          <span className="font-medium text-app-text">{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>

        <Link to={`/products/${product._id}`} className="font-medium text-sm text-app-text line-clamp-2 hover:text-app-green transition-colors">
          {product.name}
        </Link>
        <p className="text-xs text-app-text-light mt-0.5">{product.unit}</p>

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            <span className="font-semibold text-app-text">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="ml-1.5 text-xs text-app-text-light line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {outOfStock ? (
            <span className="text-xs font-semibold text-app-error">Out of stock</span>
          ) : quantity === 0 ? (
            <button
              onClick={() => addItem(product)}
              className="flex items-center gap-1 px-3 py-1.5 bg-app-green text-white text-xs font-semibold rounded-lg hover:bg-app-green-light transition-colors"
            >
              <PlusIcon className="size-3.5" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-app-green text-white rounded-lg px-1">
              <button onClick={() => decrement(product._id)} className="p-1.5 hover:bg-white/10 rounded-md" aria-label="Decrease quantity">
                <MinusIcon className="size-3.5" />
              </button>
              <span className="text-xs font-semibold w-4 text-center">{quantity}</span>
              <button
                onClick={() => increment(product._id)}
                disabled={quantity >= product.stock}
                className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <PlusIcon className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
