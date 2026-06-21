import { useEffect, useState } from "react";
import { ZapIcon } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { dummyDeals } from "../assets/assets";

/** Counts down to the end of the current day for the flash-sale urgency strip. */
function useCountdown() {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      setRemaining(Math.max(0, end.getTime() - Date.now()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(remaining / 3.6e6);
  const m = Math.floor((remaining % 3.6e6) / 6e4);
  const s = Math.floor((remaining % 6e4) / 1000);
  return [h, m, s].map((n) => String(n).padStart(2, "0"));
}

export default function FlashDeals() {
  const [h, m, s] = useCountdown();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-app-orange to-app-orange-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold flex-center gap-2">
            <ZapIcon className="size-8" /> Flash Deals
          </h1>
          <p className="mt-3 text-white/80 max-w-lg mx-auto">
            Limited-time offers on your favourite fresh picks. Grab them before they're gone!
          </p>
          <div className="mt-6 flex-center gap-2">
            {[h, m, s].map((unit, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="bg-white/15 rounded-xl px-3 py-2 text-2xl font-mono font-bold tabular-nums">
                  {unit}
                </span>
                {i < 2 && <span className="text-xl font-bold">:</span>}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/70 uppercase tracking-wider">Ends today</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {dummyDeals.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
