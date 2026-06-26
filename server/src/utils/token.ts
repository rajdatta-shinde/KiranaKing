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

/**
 * Cookie name per token type. Users/admins and delivery partners must use
 * SEPARATE cookies — sharing one name means a partner session shadows a user
 * session (and vice-versa), causing "Invalid token type" errors on routes that
 * read the cookie before the Bearer header.
 */
export const COOKIE_NAMES: Record<TokenType, string> = {
  user: "token",
  partner: "partner_token",
};

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  };
}

/** Set the auth token as an httpOnly cookie scoped to its token type. */
export function setTokenCookie(res: Response, token: string, type: TokenType = "user") {
  res.cookie(COOKIE_NAMES[type], token, {
    ...cookieOptions(),
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearTokenCookie(res: Response, type: TokenType = "user") {
  res.clearCookie(COOKIE_NAMES[type], cookieOptions());
}
