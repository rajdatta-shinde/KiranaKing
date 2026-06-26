import type { Request, Response, NextFunction } from "express";
import { verifyToken, COOKIE_NAMES } from "../utils/token";
import prisma from "../lib/prisma";

/**
 * Read the user JWT from the Authorization header or, as a fallback, the
 * httpOnly cookie.
 *
 * The Bearer header is preferred because the frontend deliberately does not
 * restore sessions: it clears its localStorage token on every boot/refresh but
 * cannot clear the httpOnly cookie. Reading the cookie first would let a stale
 * cookie from a previous session shadow the fresh token sent right after login,
 * which makes the first authenticated request (e.g. /orders/my) resolve to the
 * wrong identity and come back empty.
 */
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.[COOKIE_NAMES.user]) return req.cookies[COOKIE_NAMES.user];
  return null;
}

/** Require an authenticated customer/admin user. Attaches req.userId + email. */
export async function protect(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = verifyToken(token);
    if (payload.type !== "user") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true },
    });
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    req.userId = user.id;
    req.userEmail = user.email;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
