import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type SendMailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

let cachedTransport: nodemailer.Transporter | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.EMAIL_FROM);
}

function getTransport(): nodemailer.Transporter | null {
  if (cachedTransport) return cachedTransport;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.EMAIL_FROM) {
    return null;
  }
  cachedTransport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return cachedTransport;
}

/** Envia e-mail. Se SMTP não estiver configurado, não faz nada (evita quebrar o app). */
export async function sendMail(input: SendMailInput) {
  const transport = getTransport();
  if (!transport || !env.EMAIL_FROM) {
    console.warn("[email] SMTP não configurado (EMAIL_FROM, SMTP_HOST, SMTP_USER, SMTP_PASS). E-mail não enviado.");
    return { messageId: "", accepted: [] };
  }
  return transport.sendMail({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

