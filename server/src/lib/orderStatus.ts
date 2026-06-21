import { Prisma } from "@prisma/client";

export interface StatusEntry {
  status: string;
  timestamp: string;
  note: string;
}

/**
 * Append a status entry to an order's history and return it typed for a
 * Prisma JSON write. Stamps `timestamp` automatically and tolerates a missing
 * or malformed existing history.
 */
export function appendStatus(
  existing: unknown,
  entry: { status: string; note: string }
): Prisma.InputJsonValue {
  const prev = Array.isArray(existing) ? (existing as StatusEntry[]) : [];
  const next: StatusEntry[] = [
    ...prev,
    { ...entry, timestamp: new Date().toISOString() },
  ];
  return next as unknown as Prisma.InputJsonValue;
}
