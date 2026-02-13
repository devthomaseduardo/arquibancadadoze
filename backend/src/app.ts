import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./shared/middlewares.js";

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

const defaultOrigins = ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"];
const allowedOrigins = env.FRONTEND_ORIGINS.length > 0 ? env.FRONTEND_ORIGINS : defaultOrigins;

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^https:\/\/.+\.vercel\.app$/.test(origin)) return callback(null, true);
      return callback(new Error("Origem não permitida por CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/auth", authRoutes);
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

app.get("/health", (_req, res) => res.json({ status: "ok", service: "torcida-urbana-api" }));

app.use(errorHandler);

export default app;
