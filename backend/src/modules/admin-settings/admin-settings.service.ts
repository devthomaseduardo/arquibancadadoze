import { prisma } from "../../shared/prisma.js";
import { badRequest } from "../../shared/errors.js";

const DEFAULT_CONFIG_KEYS = [
  "about",
  "business_hours",
  "return_policy",
  "contact_whatsapp",
  "contact_email",
  "contact_instagram",
  "contact_facebook",
  "free_shipping_threshold",
] as const;

export async function getAdminSettings() {
  const [configRows, shippingPolicies] = await Promise.all([
    prisma.siteConfig.findMany({ where: { key: { in: [...DEFAULT_CONFIG_KEYS] } } }),
    prisma.shippingPolicy.findMany({ orderBy: { region: "asc" } }),
  ]);

  const config: Record<string, string> = {};
  for (const row of configRows) config[row.key] = row.value;

  if (!config.free_shipping_threshold) {
    config.free_shipping_threshold = "500";
  }

  return { config, shippingPolicies };
}

export async function updateConfigKey(key: string, value: string) {
  return prisma.siteConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function updateShippingPolicy(region: string, data: { price?: number; description?: string }) {
  if (data.price != null && data.price < 0) {
    throw badRequest("Preço de frete inválido.");
  }

  const existing = await prisma.shippingPolicy.findUnique({ where: { region } });
  if (!existing) {
    throw badRequest("Região de frete não encontrada.");
  }

  return prisma.shippingPolicy.update({
    where: { region },
    data: {
      ...(data.price != null && { price: data.price }),
      ...(data.description != null && { description: data.description }),
    },
  });
}
