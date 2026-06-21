import { Router } from "express";
import {
  getDashboard,
  getAllOrders,
  assignPartner,
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from "../controllers/adminController";
import { protect } from "../middleware/auth";
import { isAdmin } from "../middleware/admin";

const router = Router();

// Every admin route requires an authenticated admin.
router.use(protect, isAdmin);

router.get("/dashboard", getDashboard);
router.get("/orders", getAllOrders);
router.patch("/orders/:id/assign", assignPartner);

router.get("/partners", getPartners);
router.post("/partners", createPartner);
router.put("/partners/:id", updatePartner);
router.delete("/partners/:id", deletePartner);

export default router;
