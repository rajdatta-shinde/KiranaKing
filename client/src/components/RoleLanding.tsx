import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";

/**
 * The element for "/". A logged-in admin or delivery partner is bounced to
 * their own console instead of seeing the customer home page; everyone else
 * (regular customers) gets Home. Unauthenticated visitors never reach here —
 * ProtectedRoute redirects them to /login first.
 */
export default function RoleLanding() {
  const { user } = useAuth();

  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "delivery") return <Navigate to="/delivery/dashboard" replace />;

  return <Home />;
}
