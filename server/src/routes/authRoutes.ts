import { Router } from "express";
import { registerUser, loginUser, adminLogin, logout, getMe } from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", adminLogin);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
