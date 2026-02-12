import { Router } from "express";
import * as productsService from "./products.service.js";

const router = Router();

import { adminAuth } from "../../shared/middlewares.js";

router.post("/", adminAuth, async (req, res, next) => {
  try {
    const product = await productsService.createProduct(req.body);
    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
});

router.put("/:id/stock", adminAuth, async (req, res, next) => {
  try {
    const product = await productsService.updateProductStock(req.params.id, req.body.updates); // Expects { updates: [{ size: 'M', quantity: 10 }] }
    res.json(product);
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const categorySlug = req.query.category as string | undefined;
    const activeOnly = req.query.active !== "false";
    const data = await productsService.listProducts({ categorySlug, activeOnly });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const data = await productsService.getProductBySlug(req.params.slug);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
