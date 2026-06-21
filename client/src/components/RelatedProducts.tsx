import type { Product } from "../types";
import { dummyProducts } from "../assets/assets";
import ProductCard from "./ProductCard";

export default function RelatedProducts({ product }: { product: Product }) {
  const related = dummyProducts
    .filter((p) => p.category === product.category && p._id !== product._id)
    .slice(0, 5);

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-app-green mb-6">You might also like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {related.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
