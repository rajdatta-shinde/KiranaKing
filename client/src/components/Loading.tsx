import { LoaderIcon } from "lucide-react";

export default function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex-center flex-col gap-3 py-20 text-app-text-light">
      <LoaderIcon className="size-7 animate-spin text-app-green" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
