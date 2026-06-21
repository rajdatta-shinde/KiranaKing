import { Outlet } from "react-router-dom";
import Banner from "../components/Banner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartSidebar from "../components/CartSidebar";

/**
 * Shell for all customer-facing pages: dismissible Banner, sticky Navbar, the
 * routed page (Outlet), Footer, and the slide-in CartSidebar overlay.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-app-cream">
      <Banner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
    </div>
  );
}
