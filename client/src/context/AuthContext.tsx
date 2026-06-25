import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Address, User } from "../types";
import * as authApi from "../services/auth";
import { setToken } from "../services/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginAdmin: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  loginPartner: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateAddresses: (addresses: Address[]) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ROLE_KEY = "kk_role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Do NOT restore a previous session. The app should always land on the
  // login page on a fresh open or refresh, so the user explicitly chooses
  // where to go (customer / admin / delivery). Clear any persisted token so a
  // stale session never auto-logs anyone in.
  useEffect(() => {
    setToken(null);
    localStorage.removeItem(ROLE_KEY);
    setLoading(false);
  }, []);

  const persist = (next: User) => {
    setUser(next);
    localStorage.setItem(ROLE_KEY, next.role);
  };

  const login = async (email: string, password: string) => {
    const next = await authApi.login(email, password);
    persist(next);
    return next;
  };

  const loginAdmin = async (email: string, password: string) => {
    const next = await authApi.loginAdmin(email, password);
    persist(next);
    return next;
  };

  const register = async (name: string, email: string, password: string) => {
    const next = await authApi.register(name, email, password);
    persist(next);
    return next;
  };

  const loginPartner = async (email: string, password: string) => {
    const next = await authApi.loginPartner(email, password);
    persist(next);
    return next;
  };

  const logout = async () => {
    const role = user?.role ?? "customer";
    try {
      await authApi.logout(role);
    } finally {
      setUser(null);
      localStorage.removeItem(ROLE_KEY);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const me = user.role === "delivery" ? await authApi.fetchPartnerMe() : await authApi.fetchMe();
      setUser(me);
    } catch {
      /* keep the current user on a transient failure */
    }
  };

  const updateAddresses = (addresses: Address[]) => {
    setUser((prev) => (prev ? { ...prev, addresses } : prev));
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, loginAdmin, register, loginPartner, logout, refreshUser, updateAddresses }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
