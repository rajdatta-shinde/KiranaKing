import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontalIcon } from "lucide-react";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import { categoriesData } from "../assets/assets";
import { useProducts } from "../context/ProductsContext";
import type { Product } from "../types";

type SortOption = "newest" | "price_low" | "price_high";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

const PRICE_MAX = 20;

export default function Products() {
  const { products: allProducts, loading } = useProducts();
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get("category") || "";

  const [sort, setSort] = useState<SortOption>("newest");
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [showFilters, setShowFilters] = useState(false);

  // Reset price filter when the category changes via the URL.
  useEffect(() => setMaxPrice(PRICE_MAX), [activeCategory]);

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setParams(next);
  };

  const products = useMemo<Product[]>(() => {
    let list = allProducts.filter((p) => p.price <= maxPrice);
    if (activeCategory) list = list.filter((p) => p.category === activeCategory);
    switch (sort) {
      case "price_low":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      default:
        list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return list;
  }, [allProducts, activeCategory, sort, maxPrice]);

  const categoryName = categoriesData.find((c) => c.slug === activeCategory)?.name;

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-app-green">{categoryName || "All Products"}</h1>
        <p className="text-sm text-app-text-light mt-1">{products.length} products available</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className={`lg:w-64 shrink-0 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="bg-white rounded-2xl border border-app-border p-5">
            <h3 className="text-sm font-semibold text-app-green mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setCategory("")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !activeCategory ? "bg-app-green text-white" : "text-app-text-light hover:bg-app-cream"
                }`}
              >
                All Categories
              </button>
              {categoriesData.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setCategory(c.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === c.slug ? "bg-app-green text-white" : "text-app-text-light hover:bg-app-cream"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-app-border p-5">
            <h3 className="text-sm font-semibold text-app-green mb-3">Max Price</h3>
            <input
              type="range"
              min={1}
              max={PRICE_MAX}
              step={0.5}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-app-green"
            />
            <p className="text-sm text-app-text-light mt-2">Up to ${maxPrice.toFixed(2)}</p>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              onClick={() => setShowFilters((p) => !p)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-app-border rounded-xl text-sm font-medium"
            >
              <SlidersHorizontalIcon className="size-4" /> Filters
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-app-text-light">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="px-3 py-2 rounded-xl border border-app-border bg-white text-sm outline-none focus:border-app-green"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-app-border">
              <p className="font-semibold text-app-green">No products match your filters</p>
              <p className="text-sm text-app-text-light mt-1">Try widening the price range or picking another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
