import { Router } from "express";
import { adminAuth } from "../../shared/middlewares.js";
import * as influencersService from "./influencers.service.js";

const router = Router();

router.use(adminAuth);

router.get("/", async (_req, res, next) => {
  try {
    const influencers = await influencersService.listInfluencers();
    res.json(influencers);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const influencer = await influencersService.getInfluencerById(req.params.id);
    res.json(influencer);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const influencer = await influencersService.createInfluencer(req.body);
    res.status(201).json(influencer);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const influencer = await influencersService.updateInfluencer(req.params.id, req.body);
    res.json(influencer);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await influencersService.deleteInfluencer(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;

