import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Address, User, UserRole } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateAddresses: (addresses: Address[]) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "kk_auth_user";

/**
 * Phase 1: mock authentication backed by localStorage. The role is inferred
 * from the email so every protected/role-based route can be exercised without
 * a backend (e.g. `admin@…`, `partner@…`). Phase 3 replaces the bodies of
 * login/register/logout with real API + httpOnly-cookie calls; the public
 * shape of this context stays the same.
 */
function inferRole(email: string): UserRole {
  const e = email.toLowerCase();
  if (e.includes("admin")) return "admin";
  if (e.includes("partner") || e.includes("delivery")) return "delivery";
  return "customer";
}

function buildUser(name: string, email: string): User {
  const role = inferRole(email);
  return {
    _id: `usr_${btoa(email).slice(0, 10)}`,
    name,
    email,
    phone: "",
    avatar: "",
    role,
    isAdmin: role === "admin",
    addresses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setLoading(false);
  }, []);

  const persist = (next: User | null) => {
    setUser(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email: string, _password: string): Promise<User> => {
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase());
    const next = buildUser(name, email);
    persist(next);
    return next;
  };

  const register = async (name: string, email: string, _password: string): Promise<User> => {
    await new Promise((r) => setTimeout(r, 600));
    const next = buildUser(name, email);
    persist(next);
    return next;
  };

  const logout = () => persist(null);

  const updateAddresses = (addresses: Address[]) => {
    if (!user) return;
    persist({ ...user, addresses });
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateAddresses }),
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
