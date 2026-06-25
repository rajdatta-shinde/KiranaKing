import { Link } from "react-router-dom";
import { MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";
import Logo from "./Logo";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/products" },
      { label: "Flash Deals", to: "/deals" },
      { label: "Fruits & Vegetables", to: "/products?category=fruits_vegetables" },
      { label: "Beverages", to: "/products?category=drinks" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", to: "/login" },
      { label: "My Orders", to: "/orders" },
      { label: "Addresses", to: "/addresses" },
      { label: "Delivery Portal", to: "/delivery/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-app-green text-white/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Logo variant="light" />
          <p className="mt-4 text-sm max-w-xs text-white/60">
            Farm-fresh groceries and daily essentials, delivered to your door in minutes.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <a href="mailto:support@kiranaking.app" className="flex items-center gap-2 hover:text-app-orange transition-colors w-fit">
              <MailIcon className="size-4 text-app-orange" /> support@kiranaking.app
            </a>
            <a href="tel:+15550102030" className="flex items-center gap-2 hover:text-app-orange transition-colors w-fit">
              <PhoneIcon className="size-4 text-app-orange" /> +1 (555) 010-2030
            </a>
            <p className="flex items-center gap-2"><MapPinIcon className="size-4 text-app-orange" /> Springfield, IL</p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-white mb-3">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/60 hover:text-app-orange transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>© {new Date().getFullYear()} KiranaKing. All rights reserved.</p>
          <p>Built with the PERN stack.</p>
        </div>
      </div>
    </footer>
  );
}
