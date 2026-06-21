import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { heroSectionData } from "../assets/assets";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const isRegister = mode === "register";

  const validate = (): string | null => {
    if (isRegister && form.name.trim().length < 2) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    try {
      const user = isRegister
        ? await register(form.name.trim(), form.email.trim(), form.password)
        : await login(form.email.trim(), form.password);
      toast.success(isRegister ? "Account created!" : `Welcome back, ${user.name}!`);
      navigate(redirect, { replace: true });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputWrap =
    "flex items-center gap-2 px-4 py-3 rounded-xl border border-app-border focus-within:border-app-green focus-within:ring-1 focus-within:ring-app-green transition-all bg-white";

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
        <img src={heroSectionData.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="relative text-center px-12 max-w-md">
          <h2 className="text-4xl font-semibold text-white mb-4">Fresh groceries, delivered fast</h2>
          <p className="text-white/60 font-serif text-xl">
            Join KiranaKing and get farm-fresh produce at your door in minutes.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex-center mb-4">
              <Logo />
            </div>
            <h1 className="text-2xl font-semibold text-app-green mb-1">
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-app-text-light">
              {isRegister ? "Sign up to start shopping" : "Sign in to continue"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-4 border border-app-border">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-app-green mb-1.5">Full Name</label>
                <div className={inputWrap}>
                  <UserIcon className="size-4 text-app-text-light" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jordan Avery"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-app-green mb-1.5">Email</label>
              <div className={inputWrap}>
                <MailIcon className="size-4 text-app-text-light" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-app-green mb-1.5">Password</label>
              <div className={inputWrap}>
                <LockIcon className="size-4 text-app-text-light" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-app-text-light">
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-60"
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </button>

            <p className="text-center text-sm text-app-text-light">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(isRegister ? "login" : "register")}
                className="font-semibold text-app-orange hover:text-app-orange-dark"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </p>
          </form>

          <p className="text-center text-xs text-app-text-light mt-6">
            Tip: use <span className="font-mono">admin@…</span> or{" "}
            <span className="font-mono">partner@…</span> to explore those roles.{" "}
            <Link to="/" className="text-app-green hover:underline">
              Back home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
