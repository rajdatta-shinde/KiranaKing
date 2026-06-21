import type { Request, Response, NextFunction } from "express";

/** Emails granted admin access (comma-separated env var). */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Allow only admins. Must run AFTER `protect`, which sets req.userEmail.
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const email = req.userEmail?.toLowerCase();
  if (!email || !adminEmails().includes(email)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
