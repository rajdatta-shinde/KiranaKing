import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCartIcon,
  UserIcon,
  PackageIcon,
  MapPinIcon,
  LogOutIcon,
  ShieldIcon,
  MenuIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Shop", end: false },
  { to: "/deals", label: "Flash Deals", end: false },
];

export default function Navbar() {
  const { totals, openCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-app-border">
      <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-24 flex items-center gap-4">
          <Logo />

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8 ml-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive ? "text-app-green bg-app-cream" : "text-app-text-light hover:text-app-green"
                  }`
                }
              >
                {link.label === "Flash Deals" && <ZapIcon className="size-3.5 text-app-orange" />}
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Search (desktop) */}
          <div className="hidden md:block flex-1 max-w-2xl mx-auto">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1.5 ml-auto md:ml-0">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl hover:bg-app-cream transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCartIcon className="size-5 text-app-green" />
              {totals.itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-app-orange text-white text-[10px] font-bold size-4.5 rounded-full flex-center px-1">
                  {totals.itemCount}
                </span>
              )}
            </button>

            {/* Profile / auth */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-app-cream transition-colors"
                >
                  <span className="size-7 rounded-full bg-app-green text-white flex-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:block text-sm font-medium text-app-text max-w-24 truncate">
                    {user.name}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-app-border shadow-lg py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-app-border">
                      <p className="text-sm font-semibold text-app-text truncate">{user.name}</p>
                      <p className="text-xs text-app-text-light truncate">{user.email}</p>
                    </div>
                    <Link to="/orders" className="dropdown-link" onClick={() => setProfileOpen(false)}>
                      <PackageIcon className="size-4" /> My Orders
                    </Link>
                    <Link to="/addresses" className="dropdown-link" onClick={() => setProfileOpen(false)}>
                      <MapPinIcon className="size-4" /> Addresses
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" className="dropdown-link" onClick={() => setProfileOpen(false)}>
                        <ShieldIcon className="size-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-link w-full text-app-error hover:text-app-error">
                      <LogOutIcon className="size-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-app-green text-white text-sm font-semibold rounded-xl hover:bg-app-green-light transition-colors"
              >
                <UserIcon className="size-4" /> <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-app-cream transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchBar onSubmitted={() => setMenuOpen(false)} />
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden pb-4 flex flex-col gap-1 animate-fade-in">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? "text-app-green bg-app-cream" : "text-app-text-light"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
