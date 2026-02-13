import { Router } from "express";
import { adminAuth } from "../../shared/middlewares.js";
import { runSeed } from "../../shared/seed.js";

const router = Router();

router.post("/", adminAuth, async (_req, res, next) => {
  try {
    await runSeed();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
