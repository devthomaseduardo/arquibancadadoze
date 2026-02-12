import { Router } from "express";
import * as returnsService from "./returns.service.js";
import { adminAuth } from "../../shared/middlewares.js";

const router = Router();

router.use(adminAuth);

router.get("/", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const orderId = req.query.orderId as string | undefined;
    const data = await returnsService.listReturns({ status, orderId });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = await returnsService.createReturn(req.body);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { status } = req.body;
    const data = await returnsService.updateReturnStatus(req.params.id, status);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
