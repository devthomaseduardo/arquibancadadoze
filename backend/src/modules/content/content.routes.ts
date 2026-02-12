import { Router } from "express";
import * as contentService from "./content.service.js";
import { adminAuth } from "../../shared/middlewares.js";

const router = Router();

// Público
router.get("/shipping/quote", async (req, res, next) => {
  try {
    const state = String(req.query.state ?? "");
    const subtotal = Number(req.query.subtotal ?? 0);
    const data = await contentService.getShippingQuote(state, subtotal);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/shipping", async (_req, res, next) => {
  try {
    const data = await contentService.getShippingPolicies();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/faq", async (_req, res, next) => {
  try {
    const data = await contentService.getFaq();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/config", async (req, res, next) => {
  try {
    const keys = (req.query.keys as string)?.split(",").filter(Boolean) ?? [
      "about",
      "contact_whatsapp",
      "contact_email",
      "contact_instagram",
      "contact_facebook",
      "business_hours",
      "return_policy",
    ];
    const data = await contentService.getConfig(keys);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// Admin - atualizar config
router.get("/config/:key", adminAuth, async (req, res, next) => {
  try {
    const value = await contentService.getConfigKey(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (e) {
    next(e);
  }
});

router.put("/config/:key", adminAuth, async (req, res, next) => {
  try {
    const { value } = req.body;
    const data = await contentService.setConfigKey(req.params.key, value);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
