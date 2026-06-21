import { Link } from "react-router-dom";
import { categoriesData } from "../assets/assets";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
      {categoriesData.map((category) => (
        <Link
          key={category.slug}
          to={`/products?category=${category.slug}`}
          className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-app-border hover:border-app-green-lighter hover:shadow-sm transition-all"
        >
          <div className="size-14 rounded-full bg-app-cream flex-center overflow-hidden">
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="text-[11px] font-medium text-center text-app-text leading-tight">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
