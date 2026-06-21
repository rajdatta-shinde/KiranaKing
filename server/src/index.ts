import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { serve } from "inngest/express";

import { inngest } from "./inngest/client";
import { functions } from "./inngest/functions";
import { stripeWebhook } from "./controllers/paymentController";

import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import addressRoutes from "./routes/addressRoutes";
import adminRoutes from "./routes/adminRoutes";
import deliveryRoutes from "./routes/deliveryRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import { notFound, errorHandler } from "./middleware/error";

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Stripe webhook needs the RAW body — must come before express.json().
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/", (_req, res) => res.json({ status: "ok", service: "kiranaking-api" }));

// Inngest background jobs endpoint
app.use("/api/inngest", serve({ client: inngest, functions }));

// REST API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 KiranaKing API running on http://localhost:${PORT}`));
