import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { categoriesData, dummyProducts } from "../assets/assets";

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return dummyProducts.filter((p) => {
      const categoryName = categoriesData.find((c) => c.slug === p.category)?.name ?? "";
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-app-green">
        Search results for “{query}”
      </h1>
      <p className="text-sm text-app-text-light mt-1 mb-6">{results.length} products found</p>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-app-border">
          <div className="size-14 rounded-full bg-app-cream flex-center mx-auto mb-3">
            <SearchIcon className="size-6 text-app-text-light" />
          </div>
          <p className="font-semibold text-app-green">No matches found</p>
          <p className="text-sm text-app-text-light mt-1">
            Try a different keyword or{" "}
            <Link to="/products" className="text-app-orange font-medium">
              browse all products
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {results.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
