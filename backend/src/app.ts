import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./shared/middlewares.js";
import { prisma } from "./shared/prisma.js";

import categoriesRoutes from "./modules/categories/categories.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";
import metricsRoutes from "./modules/metrics/metrics.routes.js";
import contentRoutes from "./modules/content/content.routes.js";
import returnsRoutes from "./modules/returns/returns.routes.js";
import exportRoutes from "./modules/export/export.routes.js";
import campaignsRoutes from "./modules/campaigns/campaigns.routes.js";
import influencersRoutes from "./modules/influencers/influencers.routes.js";
import adminSettingsRoutes from "./modules/admin-settings/admin-settings.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import adminEmailRoutes from "./modules/admin-email/admin-email.routes.js";
import adminSeedRoutes from "./modules/admin-seed/admin-seed.routes.js";
import adminProductsRoutes from "./modules/admin-products/admin-products.routes.js";

const defaultOrigins = ["http://localhost:8080", "http://localhost:8081", "http://localhost:5173", "http://localhost:3000"];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...env.FRONTEND_ORIGINS]));

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas, tente novamente em alguns minutos.", code: "RATE_LIMIT" },
});

const ordersLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas solicitações de pedido.", code: "RATE_LIMIT" },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true);
      if (/^https:\/\/.+\.vercel\.app$/.test(origin)) return callback(null, true);
      return callback(new Error("Origem não permitida por CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(apiLimiter);

app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersLimiter, ordersRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/content", contentRoutes);

app.use("/api/admin/metrics", metricsRoutes);
app.use("/api/admin/returns", returnsRoutes);
app.use("/api/admin/export", exportRoutes);
app.use("/api/admin/campaigns", campaignsRoutes);
app.use("/api/admin/influencers", influencersRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/admin/test-email", adminEmailRoutes);
app.use("/api/admin/seed", adminSeedRoutes);
app.use("/api/admin/products", adminProductsRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", service: "torcida-urbana-api", db: "ok" });
  } catch {
    res.status(503).json({ status: "degraded", service: "torcida-urbana-api", db: "error" });
  }
});

app.use(errorHandler);

export default app;
