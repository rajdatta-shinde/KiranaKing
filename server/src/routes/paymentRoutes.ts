import { Router } from "express";
import { createPaymentIntent } from "../controllers/paymentController";
import { protect } from "../middleware/auth";

const router = Router();

// Note: the Stripe webhook is mounted separately in index.ts (needs raw body).
router.post("/create-intent", protect, createPaymentIntent);

export default router;
