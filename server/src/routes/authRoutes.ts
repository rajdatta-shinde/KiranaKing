import { Router } from "express";
import { registerUser, loginUser, logout, getMe } from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
