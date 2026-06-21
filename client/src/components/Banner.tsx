import { useEffect, useState } from "react";
import { SparklesIcon, XIcon } from "lucide-react";

const STORAGE_KEY = "kk_banner_dismissed";

/**
 * Dismissible promo banner. The dismissed state persists for the browser
 * session only (sessionStorage), so it reappears on a fresh visit.
 */
export default function Banner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(sessionStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative bg-app-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex-center gap-2 text-center text-sm font-medium">
        <SparklesIcon className="size-4 text-app-orange shrink-0" />
        <p>
          Free delivery on your first 3 orders over $35 — use code{" "}
          <span className="font-semibold text-app-orange">FRESH35</span>
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss banner"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
