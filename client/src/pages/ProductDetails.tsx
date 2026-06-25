import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  StarIcon,
  MinusIcon,
  PlusIcon,
  LeafIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import { getProduct } from "../services/products";
import { productImage } from "../utils/image";
import type { Product } from "../types";
import Loading from "../components/Loading";
import ReviewSection from "../components/ReviewSection";
import RelatedProducts from "../components/RelatedProducts";

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem, getQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setProduct(undefined);
    if (!id) {
      setProduct(null);
      return;
    }
    getProduct(id)
      .then((p) => {
        if (!cancelled) setProduct({ ...p, image: productImage(p.image, p.name) });
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (product === undefined) return <Loading label="Loading product..." />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-lg font-semibold text-app-green">Product not found</p>
        <Link to="/products" className="mt-3 inline-block text-app-orange font-medium">
          ← Back to products
        </Link>
      </div>
    );
  }

  const inCart = getQuantity(product._id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-app-text-light mb-6">
        <Link to="/" className="hover:text-app-green">Home</Link>
        <ChevronRightIcon className="size-3.5" />
        <Link to={`/products?category=${product.category}`} className="hover:text-app-green capitalize">
          {product.category.replace(/_/g, " ")}
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <span className="text-app-text font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-white rounded-3xl border border-app-border flex-center p-10">
            <img src={product.image} alt={product.name} className="max-h-full object-contain" />
          </div>
          <div className="flex gap-3 mt-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="size-20 bg-white rounded-xl border border-app-border flex-center p-2">
                <img src={product.image} alt="" className="max-h-full object-contain opacity-90" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          {product.isOrganic && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
              <LeafIcon className="size-3.5" /> Organic
            </span>
          )}
          <h1 className="text-3xl font-semibold text-app-green">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <StarIcon className="size-4 text-app-warning fill-app-warning" />
              <span className="font-semibold text-app-text">{product.rating}</span>
            </div>
            <span className="text-sm text-app-text-light">{product.reviewCount} reviews</span>
            <span className="text-app-border">|</span>
            <span className="text-sm text-app-text-light">{product.unit}</span>
          </div>

          <div className="flex items-end gap-3 mt-5">
            <span className="text-3xl font-semibold text-app-green">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-app-text-light line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-sm font-semibold text-app-orange bg-orange-50 px-2 py-0.5 rounded-full mb-1">
                  Save {product.discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-5 text-app-text-light leading-relaxed">{product.description}</p>

          <div className="mt-5 text-sm">
            {outOfStock ? (
              <span className="font-semibold text-app-error">Out of stock</span>
            ) : (
              <span className="font-medium text-app-success">In stock — {product.stock} available</span>
            )}
          </div>

          {/* Quantity + add to cart */}
          {!outOfStock && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-app-cream rounded-xl px-2 py-1.5 border border-app-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 rounded-lg hover:bg-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="size-4" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-40"
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="size-4" />
                </button>
              </div>
              <button
                onClick={() => addItem(product, quantity)}
                className="flex items-center gap-2 px-7 py-3.5 bg-app-orange text-white font-semibold rounded-xl hover:bg-app-orange-dark transition-colors active:scale-[0.98]"
              >
                <ShoppingCartIcon className="size-5" /> Add to Cart
                {inCart > 0 && <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{inCart} in cart</span>}
              </button>
            </div>
          )}

          {/* Perks */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-app-text-light">
              <TruckIcon className="size-4 text-app-green" /> Free delivery over $35
            </div>
            <div className="flex items-center gap-2 text-sm text-app-text-light">
              <ShieldCheckIcon className="size-4 text-app-green" /> Freshness guaranteed
            </div>
          </div>
        </div>
      </div>

      <ReviewSection product={product} />
      <RelatedProducts product={product} />
    </div>
  );
}
