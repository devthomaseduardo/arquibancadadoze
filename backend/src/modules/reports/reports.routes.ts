import { Router } from "express";
import { adminAuth } from "../../shared/middlewares.js";
import * as reportsService from "./reports.service.js";

const router = Router();
router.use(adminAuth);

router.get("/sales", async (req, res, next) => {
  try {
    const groupBy = req.query.groupBy === "month" ? "month" : "day";
    const data = await reportsService.getSalesReport({
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      groupBy,
    });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
