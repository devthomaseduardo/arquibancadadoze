import { Router } from "express";
import { adminAuth } from "../../shared/middlewares.js";
import * as campaignsService from "./campaigns.service.js";

const router = Router();

router.use(adminAuth);

router.get("/", async (_req, res, next) => {
  try {
    const campaigns = await campaignsService.listCampaigns();
    res.json(campaigns);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const campaign = await campaignsService.getCampaignById(req.params.id);
    res.json(campaign);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const campaign = await campaignsService.createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const campaign = await campaignsService.updateCampaign(req.params.id, req.body);
    res.json(campaign);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await campaignsService.deleteCampaign(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;

