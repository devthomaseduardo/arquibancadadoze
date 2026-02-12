import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/torcida_urbana?schema=public",
  ADMIN_API_KEY: process.env.ADMIN_API_KEY ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "torcida-urbana-jwt-secret-mude-em-producao",
  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
  MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY ?? "",
  FRONTEND_ORIGINS: (process.env.FRONTEND_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
