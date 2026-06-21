import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { protect } from "../middleware/auth";
import { isAdmin } from "../middleware/admin";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only writes (image field name: "image").
router.post("/", protect, isAdmin, upload.single("image"), createProduct);
router.put("/:id", protect, isAdmin, upload.single("image"), updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;
