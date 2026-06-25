import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheckIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import toast from "react-hot-toast";
import { heroSectionData } from "../../assets/assets";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginAdmin(email.trim(), password);
      if (user.role !== "admin") {
        await logout();
        toast.error("This account is not an administrator.");
        return;
      }
      toast.success(`Welcome, ${user.name}!`);
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
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
        <img src={heroSectionData.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="relative text-center px-12 max-w-md">
          <h2 className="text-4xl font-semibold text-white mb-4">Admin Console</h2>
          <p className="text-white/60 font-serif text-xl">
            Manage products, orders and delivery partners from one place.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex-center gap-2 mb-4">
              <ShieldCheckIcon className="size-7 text-app-green" />
              <span className="text-2xl font-semibold text-app-green">KiranaKing</span>
            </div>
            <h1 className="text-2xl font-semibold text-app-green mb-1">Admin Login</h1>
            <p className="text-sm text-app-text-light">Sign in to the admin console</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-4 border border-app-border">
            <div>
              <label className="block text-sm font-medium text-app-green mb-1.5">Email</label>
              <div className={inputWrap}>
                <MailIcon className="size-4 text-app-text-light" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-app-text-light mt-6">
            <Link to="/login" className="font-semibold text-app-green hover:underline">
              Back to customer sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
