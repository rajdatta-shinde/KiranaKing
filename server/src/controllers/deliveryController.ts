import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { generateToken, setTokenCookie, clearTokenCookie } from "../utils/token";

const partnerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  vehicleType: true,
  isActive: true,
  createdAt: true,
} as const;

/** POST /api/delivery/login */
export const loginPartner = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const partner = await prisma.deliveryPartner.findUnique({ where: { email } });
  if (!partner || !(await bcrypt.compare(password, partner.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(partner.id, "partner");
  setTokenCookie(res, token, "partner");
  const { password: _pw, ...safe } = partner;
  res.json({ partner: safe, token });
});

/** POST /api/delivery/logout */
export const logoutPartner = asyncHandler(async (_req, res) => {
  clearTokenCookie(res, "partner");
  res.json({ message: "Logged out" });
});

/** GET /api/delivery/me */
export const getPartnerProfile = asyncHandler(async (req, res) => {
  const partner = await prisma.deliveryPartner.findUnique({
    where: { id: req.partnerId },
    select: partnerSelect,
  });
  if (!partner) return res.status(404).json({ message: "Partner not found" });
  res.json({ partner });
});

/** GET /api/delivery/orders — orders assigned to the logged-in partner. */
export const getAssignedOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { deliveryPartnerId: req.partnerId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, phone: true } } },
  });
  res.json({ orders });
});
