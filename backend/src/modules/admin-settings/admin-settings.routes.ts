import { Router } from "express";
import { adminAuth } from "../../shared/middlewares.js";
import * as service from "./admin-settings.service.js";

const router = Router();
router.use(adminAuth);

router.get("/", async (_req, res, next) => {
  try {
    const data = await service.getAdminSettings();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.put("/config/:key", async (req, res, next) => {
  try {
    const value = String(req.body?.value ?? "");
    const data = await service.updateConfigKey(req.params.key, value);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.put("/shipping/:region", async (req, res, next) => {
  try {
    const price = req.body?.price != null ? Number(req.body.price) : undefined;
    const description = req.body?.description;
    const data = await service.updateShippingPolicy(req.params.region, { price, description });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
