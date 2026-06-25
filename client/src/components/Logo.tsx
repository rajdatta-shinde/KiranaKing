import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

/** KiranaKing brand logo (cart + crown wordmark) served from /public. */
export default function Logo({
  className,
  to = "/",
}: {
  className?: string;
  to?: string;
  /** Kept for API compatibility; the PNG wordmark is colour-fixed. */
  variant?: "dark" | "light";
}) {
  return (
    <Link to={to} className={cn("flex items-center shrink-0", className)}>
      <img
        src="/kirana king logo.png"
        alt="KiranaKing"
        className="h-28 w-auto object-contain translate-y-4"
      />
    </Link>
  );
}
