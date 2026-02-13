import { Request, Response, NextFunction } from "express";
import { AppError } from "./errors.js";
import { env } from "../config/env.js";
import { verifyToken } from "../modules/auth/auth.service.js";

export function adminAuth(req: Request, _res: Response, next: NextFunction) {
  const payload = getJwtPayload(req);
  if (payload?.role === "ADMIN") return next();

  const key = req.headers["x-admin-key"] ?? req.query.adminKey;
  if (env.ADMIN_API_KEY && env.ADMIN_API_KEY === key) return next();

  next(unauthorized("Acesso administrativo não autorizado"));
}

// TODO: migrar para validação por JWT com role ADMIN (quando user.role estiver persistido)

function unauthorized(message: string) {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const payload = getJwtPayload(req);
  if (!payload) return next(unauthorized("Faça login para continuar."));
  (req as unknown as { user: typeof payload }).user = payload;
  next();
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const payload = getJwtPayload(req);
  if (payload) (req as unknown as { user: typeof payload }).user = payload;
  next();
}

function getJwtPayload(req: Request) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return token ? verifyToken(token) : null;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }
  console.error(err);
  res.status(500).json({
    error: "Erro interno do servidor",
    code: "INTERNAL_ERROR",
  });
}
