import jwt from "jsonwebtoken";
import type { Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const MAX_AGE_DAYS = 30;

export type TokenType = "user" | "partner";

export interface TokenPayload {
  id: string;
  type: TokenType;
}

export function generateToken(id: string, type: TokenType = "user"): string {
  return jwt.sign({ id, type } satisfies TokenPayload, JWT_SECRET, {
    expiresIn: MAX_AGE_DAYS * 24 * 60 * 60, // seconds
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/** Set the auth token as an httpOnly cookie. */
export function setTokenCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearTokenCookie(res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
}
