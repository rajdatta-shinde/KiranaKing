import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { cn } from "../utils/cn";

export default function SearchBar({
  className,
  onSubmitted,
}: {
  className?: string;
  onSubmitted?: () => void;
}) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onSubmitted?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 w-full bg-app-cream-dark/60 rounded-xl px-3.5 py-2.5 border border-transparent focus-within:border-app-green-lighter focus-within:bg-white transition-colors",
        className
      )}
    >
      <SearchIcon className="size-4 text-app-text-light shrink-0" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for fruits, snacks, drinks..."
        className="w-full bg-transparent text-sm text-app-text placeholder:text-app-text-light"
      />
    </form>
  );
}
