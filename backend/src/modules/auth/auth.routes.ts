import { Router } from "express";
import * as authService from "./auth.service.js";
import { authOptional, authRequired } from "../../shared/middlewares.js";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";

const router = Router();
const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

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

router.post("/google", async (req, res, next) => {
  try {
    if (!googleClient) return res.status(500).json({ error: "Google OAuth não configurado" });
    const { credential } = req.body as { credential?: string };
    if (!credential) return res.status(400).json({ error: "Token do Google ausente" });

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) return res.status(400).json({ error: "Token Google inválido" });

    const data = await authService.upsertGoogleUser(payload.sub, payload.email, payload.name || payload.email);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
