import { prisma } from "../../shared/prisma.js";
import { badRequest } from "../../shared/errors.js";

export async function getShippingPolicies() {
  return prisma.shippingPolicy.findMany({ orderBy: { region: "asc" } });
}

export async function getShippingQuote(state: string, subtotal = 0) {
  const uf = (state || "").trim().toUpperCase();
  if (uf.length !== 2) throw badRequest("UF inválida para cálculo de frete.");

  const region = mapStateToRegion(uf);
  const [policy, freeShippingRow] = await Promise.all([
    prisma.shippingPolicy.findUnique({ where: { region } }),
    prisma.siteConfig.findUnique({ where: { key: "free_shipping_threshold" } }),
  ]);

  const baseShipping = policy?.price ?? 45;
  const freeShippingThreshold = Number(freeShippingRow?.value ?? 500);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const finalShippingCost = isFreeShipping ? 0 : baseShipping;

  return {
    state: uf,
    region,
    baseShipping,
    freeShippingThreshold,
    isFreeShipping,
    finalShippingCost,
    estimateDays: {
      min: 5,
      max: region === "Norte" || region === "Nordeste" ? 15 : 10,
    },
    policyDescription: policy?.description ?? null,
  };
}

export async function getFaq() {
  return prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getConfig(keys: string[]) {
  const rows = await prisma.siteConfig.findMany({
    where: { key: { in: keys } },
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function getConfigKey(key: string): Promise<string | null> {
  const row = await prisma.siteConfig.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setConfigKey(key: string, value: string) {
  return prisma.siteConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

function mapStateToRegion(state: string): string {
  const sudeste = ["SP", "RJ", "MG", "ES"];
  const sul = ["PR", "SC", "RS"];
  const nordeste = ["BA", "CE", "PE", "RN", "PB", "AL", "SE", "MA", "PI"];
  const norte = ["AM", "PA", "RO", "AC", "RR", "AP", "TO"];
  const centroOeste = ["DF", "GO", "MT", "MS"];
  if (sudeste.includes(state)) return "Sudeste";
  if (sul.includes(state)) return "Sul";
  if (nordeste.includes(state)) return "Nordeste";
  if (norte.includes(state)) return "Norte";
  if (centroOeste.includes(state)) return "Centro-Oeste";
  return "Centro-Oeste";
}
