import { prisma } from "../../shared/prisma.js";
import { notFound } from "../../shared/errors.js";

export async function listInfluencers() {
  return prisma.influencer.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getInfluencerById(id: string) {
  const influencer = await prisma.influencer.findUnique({ where: { id } });
  if (!influencer) throw notFound("Influenciador não encontrado");
  return influencer;
}

type InfluencerInput = {
  name: string;
  couponCode: string;
  commissionRate?: number;
  active?: boolean;
};

export async function createInfluencer(input: InfluencerInput) {
  const data = normalizeInput(input);
  const influencer = await prisma.influencer.create({ data });
  return influencer;
}

export async function updateInfluencer(id: string, input: Partial<InfluencerInput>) {
  await getInfluencerById(id);
  const data = normalizeInput(input);
  const influencer = await prisma.influencer.update({
    where: { id },
    data,
  });
  return influencer;
}

export async function deleteInfluencer(id: string) {
  await getInfluencerById(id);
  await prisma.influencer.delete({ where: { id } });
}

function normalizeInput(input: Partial<InfluencerInput>): any {
  const { name, couponCode, commissionRate, active } = input;
  const data: any = {};

  if (typeof name === "string") data.name = name.trim();
  if (typeof couponCode === "string") data.couponCode = couponCode.trim().toUpperCase();
  if (typeof commissionRate === "number") data.commissionRate = commissionRate;
  if (typeof active === "boolean") data.active = active;

  return data;
}

