import type { Request, Response, NextFunction } from "express";
import { verifyToken, COOKIE_NAMES } from "../utils/token";
import prisma from "../lib/prisma";

// Prefer the Bearer header over the cookie so a stale httpOnly cookie from a
// previous session can't shadow the fresh token sent right after login. See the
// matching note in middleware/auth.ts.
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.[COOKIE_NAMES.partner]) return req.cookies[COOKIE_NAMES.partner];
  return null;
}

/** Require an authenticated delivery partner. Attaches req.partnerId. */
export async function protectPartner(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = verifyToken(token);
    if (payload.type !== "partner") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id: payload.id },
      select: { id: true },
    });
    if (!partner) return res.status(401).json({ message: "Partner no longer exists" });

    req.partnerId = partner.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
