import { Routes, Route } from "react-router-dom";

// Layouts
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./pages/admin/AdminLayout";
import DeliveryLayout from "./pages/delivery/DeliveryLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleLanding from "./components/RoleLanding";

// Public pages
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import FlashDeals from "./pages/FlashDeals";
import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

// Customer (protected) pages
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import Addresses from "./pages/Addresses";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDeliveryPartners from "./pages/admin/AdminDeliveryPartners";

// Delivery pages
import DeliveryLogin from "./pages/delivery/DeliveryLogin";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

export default function App() {
  return (
    <Routes>
      {/* Standalone (no AppLayout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/delivery/login" element={<DeliveryLogin />} />

      {/* Customer-facing shell — requires an authenticated user. Visiting any of
          these while logged out redirects to /login with a redirect back. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RoleLanding />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/deals" element={<FlashDeals />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="/addresses" element={<Addresses />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Admin (role: admin) */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/new" element={<AdminProductForm />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/delivery-partners" element={<AdminDeliveryPartners />} />
        </Route>
      </Route>

      {/* Delivery partner (role: delivery) */}
      <Route element={<ProtectedRoute roles={["delivery"]} />}>
        <Route element={<DeliveryLayout />}>
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
