import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../shared/prisma.js";
import { badRequest, notFound } from "../../shared/errors.js";
import { env } from "../../config/env.js";

const SALT_ROUNDS = 10;

export type JwtPayload = { userId: string; email: string };

export async function register(name: string, email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw badRequest("E-mail já cadastrado.");

  if (!password || password.length < 6) throw badRequest("Senha deve ter no mínimo 6 caracteres.");

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalized, passwordHash },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
}

export async function login(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) throw notFound("E-mail ou senha incorretos.");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw notFound("E-mail ou senha incorretos.");

  const token = signToken({ userId: user.id, email: user.email });
  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token,
  };
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) throw notFound("Usuário não encontrado");
  return user;
}
