import { Router } from "express";
import { adminAuth } from "../../shared/middlewares.js";
import { sendMail, isEmailConfigured } from "../../shared/email.js";
import { serviceUnavailable } from "../../shared/errors.js";

const router = Router();
router.use(adminAuth);

router.post("/", async (req, res, next) => {
  try {
    if (!isEmailConfigured()) {
      return next(serviceUnavailable("E-mail não configurado. Defina EMAIL_FROM, SMTP_HOST, SMTP_USER e SMTP_PASS no .env do backend."));
    }
    const to = String(req.body?.to ?? "").trim();
    if (!to) return res.status(400).json({ error: "Campo 'to' e obrigatorio." });

    await sendMail({
      to,
      subject: "Teste SMTP - Arquibancada 12",
      text: "Este e um e-mail de teste do backend (SMTP).",
      html: "<p>Este e um <strong>e-mail de teste</strong> do backend (SMTP).</p>",
    });

    res.json({ ok: true });
  } catch (e) {
    next(e as Error);
  }
});

export default router;

