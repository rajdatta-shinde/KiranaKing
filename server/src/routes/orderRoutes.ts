import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  verifyDeliveryOtp,
  updateLiveLocation,
  getLiveLocation,
} from "../controllers/orderController";
import { protect } from "../middleware/auth";
import { protectPartner } from "../middleware/delivery";

const router = Router();

// Customer
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/cancel", protect, cancelOrder);
router.get("/:id/location", protect, getLiveLocation);

// Admin advances status (admin check done via /admin routes or here loosely).
router.patch("/:id/status", protect, updateOrderStatus);

// Delivery partner
router.patch("/:id/partner-status", protectPartner, updateOrderStatus);
router.post("/:id/verify-otp", protectPartner, verifyDeliveryOtp);
router.patch("/:id/location", protectPartner, updateLiveLocation);

export default router;
