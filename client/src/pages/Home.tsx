import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  TruckIcon,
  ClockIcon,
  ShieldCheckIcon,
  LeafIcon,
  ZapIcon,
} from "lucide-react";
import CategoryGrid from "../components/CategoryGrid";
import ProductCard from "../components/ProductCard";
import { heroSectionData } from "../assets/assets";
import { useProducts } from "../context/ProductsContext";

const trustBadges = [
  { icon: TruckIcon, title: "Free Delivery", desc: "On orders over $35" },
  { icon: ClockIcon, title: "Express Delivery", desc: "In as fast as 15 min" },
  { icon: LeafIcon, title: "Farm Fresh", desc: "Sourced daily" },
  { icon: ShieldCheckIcon, title: "Secure Payments", desc: "100% protected" },
];

export default function Home() {
  const { products } = useProducts();
  const popular = products.slice(0, 10);
  const dummyDeals = [...products]
    .filter((p) => p.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 8);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-app-green">
        <img
          src={heroSectionData.hero_image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative px-6 sm:px-12 py-14 sm:py-20 max-w-xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-app-orange bg-white/10 px-3 py-1 rounded-full mb-5">
            <ZapIcon className="size-3.5" /> Groceries in minutes
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
            Nourish your home with <span className="text-app-orange font-serif italic">Earth's finest</span>
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-md">{heroSectionData.subtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-app-orange text-white font-semibold rounded-xl hover:bg-app-orange-dark transition-colors"
            >
              Shop Now <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              Browse Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {trustBadges.map((badge) => (
          <div key={badge.title} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-app-border">
            <span className="size-11 rounded-xl bg-app-cream flex-center text-app-green shrink-0">
              <badge.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-app-text">{badge.title}</p>
              <p className="text-xs text-app-text-light">{badge.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-app-green">Browse Categories</h2>
          <Link to="/products" className="text-sm font-medium text-app-orange hover:text-app-orange-dark">
            View all →
          </Link>
        </div>
        <CategoryGrid />
      </section>

      {/* Flash deals strip */}
      {dummyDeals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold text-app-green flex items-center gap-2">
              <ZapIcon className="size-6 text-app-orange" /> Flash Deals
            </h2>
            <Link to="/deals" className="text-sm font-medium text-app-orange hover:text-app-orange-dark">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {dummyDeals.slice(0, 5).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Popular products */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-app-green">Popular Products</h2>
          <Link to="/products" className="text-sm font-medium text-app-orange hover:text-app-orange-dark">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {popular.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Delivery promo */}
      <section className="relative overflow-hidden rounded-3xl bg-app-green text-white px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Get fresh groceries in <span className="text-app-orange">minutes</span>
          </h2>
          <p className="mt-2 text-white/70 max-w-md">
            Download the KiranaKing app and track every order live, from packing to your doorstep.
          </p>
          <div className="mt-5 flex gap-3">
            <button className="px-5 py-2.5 bg-white text-app-green font-semibold rounded-xl text-sm">App Store</button>
            <button className="px-5 py-2.5 bg-white/10 text-white font-semibold rounded-xl text-sm">Google Play</button>
          </div>
        </div>
        <img src={heroSectionData.delivery_truck} alt="" className="w-48 sm:w-60 shrink-0" />
      </section>

      {/* Newsletter */}
      <section className="bg-white rounded-3xl border border-app-border px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold text-app-green">Subscribe to our Newsletter</h2>
        <p className="mt-2 text-app-text-light max-w-md mx-auto text-sm">
          Get the latest deals and fresh arrivals straight to your inbox. No spam, ever.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-5 flex max-w-md mx-auto gap-2"
        >
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 px-4 py-3 rounded-xl border border-app-border focus:border-app-green outline-none text-sm"
          />
          <button className="px-6 py-3 bg-app-orange text-white font-semibold rounded-xl hover:bg-app-orange-dark transition-colors text-sm">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
