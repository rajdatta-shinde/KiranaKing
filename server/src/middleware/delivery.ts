import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import prisma from "../lib/prisma";

function extractToken(req: Request): string | null {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
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
