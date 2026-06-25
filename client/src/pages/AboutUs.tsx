import { Link } from "react-router-dom";
import { LeafIcon, TruckIcon, HeartIcon, ShieldCheckIcon } from "lucide-react";

const values = [
  {
    icon: LeafIcon,
    title: "Farm-fresh quality",
    body: "We partner directly with local farms and trusted suppliers so every order arrives fresh.",
  },
  {
    icon: TruckIcon,
    title: "Delivered in minutes",
    body: "Our hyperlocal network gets daily essentials to your door faster than a trip to the store.",
  },
  {
    icon: HeartIcon,
    title: "Customer first",
    body: "From easy returns to responsive support, we obsess over making shopping effortless.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Honest pricing",
    body: "Fair, transparent prices with no hidden fees — and real deals you can actually trust.",
  },
];

const stats = [
  { value: "50k+", label: "Happy customers" },
  { value: "10k+", label: "Products" },
  { value: "15 min", label: "Avg. delivery" },
  { value: "24/7", label: "Support" },
];

export default function AboutUs() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center">
        <p className="text-sm font-semibold text-app-orange uppercase tracking-wide">About Us</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-app-text">
          Groceries, reimagined for your everyday
        </h1>
        <p className="mt-4 text-app-text-light max-w-2xl mx-auto">
          KiranaKing started with a simple idea — getting fresh groceries and daily essentials
          should be quick, reliable, and delightful. Today we serve thousands of homes with
          farm-fresh produce and household favorites, delivered in minutes.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
            <p className="text-2xl font-bold text-app-green">{s.value}</p>
            <p className="mt-1 text-sm text-app-text-light">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-app-text text-center">What we stand for</h2>
        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          {values.map((v) => (
            <div key={v.title} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="shrink-0 size-12 rounded-xl bg-app-green/10 flex items-center justify-center">
                <v.icon className="size-6 text-app-green" />
              </div>
              <div>
                <h3 className="font-semibold text-app-text">{v.title}</h3>
                <p className="mt-1 text-sm text-app-text-light">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 bg-app-green rounded-2xl px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-white">Ready to shop fresh?</h2>
        <p className="mt-2 text-white/70 max-w-lg mx-auto">
          Browse thousands of products and get them delivered to your door in minutes.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block px-6 py-3 bg-app-orange text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Start Shopping
        </Link>
      </section>
    </div>
  );
}
