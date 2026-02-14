import { Router } from "express";
import { adminAuth } from "../../shared/middlewares.js";
import * as productsService from "../products/products.service.js";

const router = Router();
router.use(adminAuth);

/** Lista produtos com fornecedor e custo (só admin). Cliente não vê essa informação. */
router.get("/", async (req, res, next) => {
  try {
    const categorySlug = req.query.category as string | undefined;
    const activeOnly = req.query.active !== "false";
    const data = await productsService.listProductsForAdmin({ categorySlug, activeOnly });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
