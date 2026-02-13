import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type SendMailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

let cachedTransport: nodemailer.Transporter | null = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error("SMTP nao configurado (SMTP_HOST/SMTP_USER/SMTP_PASS).");
  }

  cachedTransport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  return cachedTransport;
}

export async function sendMail(input: SendMailInput) {
  if (!env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM nao configurado.");
  }

  const transport = getTransport();
  return transport.sendMail({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

