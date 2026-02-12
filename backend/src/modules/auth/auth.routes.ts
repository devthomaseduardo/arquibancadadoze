import { Router } from "express";
import * as authService from "./auth.service.js";
import { authOptional, authRequired } from "../../shared/middlewares.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
    }
    const data = await authService.register(name, email, password);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }
    const data = await authService.login(email, password);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/me", authRequired, async (req, res, next) => {
  try {
    const payload = (req as unknown as { user: authService.JwtPayload }).user;
    const user = await authService.getUserById(payload.userId);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

export default router;
