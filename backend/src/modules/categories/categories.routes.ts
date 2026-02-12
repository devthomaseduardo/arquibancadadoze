import { Router } from "express";
import * as categoriesService from "./categories.service.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const activeOnly = _req.query.active !== "false";
    const data = await categoriesService.listCategories(activeOnly);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const data = await categoriesService.getCategoryBySlug(req.params.slug);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
