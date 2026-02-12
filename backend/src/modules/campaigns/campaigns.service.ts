import { prisma } from "../../shared/prisma.js";
import { notFound } from "../../shared/errors.js";

export async function listCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignById(id: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) throw notFound("Campanha não encontrada");
  return campaign;
}

type CampaignInput = {
  name: string;
  targetCategorySlug?: string | null;
  active?: boolean;
  startDate: string | Date;
  endDate: string | Date;
  minMarginOverride?: number | null;
};

export async function createCampaign(input: CampaignInput) {
  const data = normalizeInput(input);
  const campaign = await prisma.campaign.create({ data });
  return campaign;
}

export async function updateCampaign(id: string, input: Partial<CampaignInput>) {
  await getCampaignById(id);
  const data = normalizeInput(input);
  const campaign = await prisma.campaign.update({
    where: { id },
    data,
  });
  return campaign;
}

export async function deleteCampaign(id: string) {
  await getCampaignById(id);
  await prisma.campaign.delete({ where: { id } });
}

function normalizeInput(input: Partial<CampaignInput>): any {
  const {
    name,
    targetCategorySlug,
    active,
    startDate,
    endDate,
    minMarginOverride,
  } = input;

  const data: any = {};
  if (typeof name === "string") data.name = name.trim();
  if (typeof targetCategorySlug !== "undefined") {
    data.targetCategorySlug = targetCategorySlug || null;
  }
  if (typeof active === "boolean") data.active = active;
  if (typeof startDate !== "undefined") {
    data.startDate = startDate instanceof Date ? startDate : new Date(startDate);
  }
  if (typeof endDate !== "undefined") {
    data.endDate = endDate instanceof Date ? endDate : new Date(endDate);
  }
  if (typeof minMarginOverride !== "undefined") {
    data.minMarginOverride = minMarginOverride ?? null;
  }
  return data;
}

