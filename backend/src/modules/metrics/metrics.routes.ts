import { Router } from "express";
import * as metricsService from "./metrics.service.js";
import { adminAuth } from "../../shared/middlewares.js";

const router = Router();

router.get("/", adminAuth, async (req, res, next) => {
  try {
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    let period: metricsService.MetricsPeriod = null;
    if (dateFrom && dateTo) {
      period = {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      };
    }
    const data = await metricsService.getMetrics(period);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
