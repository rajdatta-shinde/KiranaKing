import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import prisma from "../lib/prisma";

/** Read the JWT from the httpOnly cookie or the Authorization header. */
function extractToken(req: Request): string | null {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
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
