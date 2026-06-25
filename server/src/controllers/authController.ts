import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { generateToken, setTokenCookie, clearTokenCookie } from "../utils/token";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const;

function isAdminEmail(email: string): boolean {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}

/** POST /api/auth/register */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: userSelect,
  });

  const token = generateToken(user.id, "user");
  setTokenCookie(res, token);
  res.status(201).json({ user: { ...user, isAdmin: isAdminEmail(user.email) }, token });
});

/** POST /api/auth/login */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Admins must use the dedicated admin login endpoint.
  if (isAdminEmail(email)) {
    return res.status(403).json({ message: "Admins must sign in from the Login as Admin page." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user.id, "user");
  setTokenCookie(res, token);
  const { password: _pw, ...safe } = user;
  res.json({ user: { ...safe, isAdmin: isAdminEmail(user.email) }, token });
});

/** POST /api/auth/admin/login — admins only. */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!isAdminEmail(email)) {
    return res.status(403).json({ message: "This account is not an administrator." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user.id, "user");
  setTokenCookie(res, token);
  const { password: _pw, ...safe } = user;
  res.json({ user: { ...safe, isAdmin: true }, token });
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (_req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
});

/** GET /api/auth/me */
export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { ...userSelect, addresses: true },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: { ...user, isAdmin: isAdminEmail(user.email) } });
});
