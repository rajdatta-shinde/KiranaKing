import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "../types";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

/**
 * Guards nested routes. Pass `roles` to restrict to specific user roles;
 * omit it to allow any authenticated user. Unauthenticated users are sent to
 * /login with a redirect back; wrong-role users are bounced home.
 */
export default function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
