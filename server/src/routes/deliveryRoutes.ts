import { Router } from "express";
import {
  loginPartner,
  logoutPartner,
  getPartnerProfile,
  getAssignedOrders,
} from "../controllers/deliveryController";
import { protectPartner } from "../middleware/delivery";

const router = Router();

router.post("/login", loginPartner);
router.post("/logout", logoutPartner);
router.get("/me", protectPartner, getPartnerProfile);
router.get("/orders", protectPartner, getAssignedOrders);

export default router;
