import { prisma } from "../../shared/prisma.js";
import { notFound } from "../../shared/errors.js";

export async function listReturns(filters?: { status?: string; orderId?: string }) {
  const where: { status?: string; orderId?: string } = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.orderId) where.orderId = filters.orderId;

  return prisma.returnExchange.findMany({
    where,
    include: { order: { select: { orderNumber: true, customerName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createReturn(data: {
  orderId: string;
  reason: string;
  description?: string;
  status?: string;
}) {
  const order = await prisma.order.findUnique({ where: { id: data.orderId } });
  if (!order) throw notFound("Pedido não encontrado");

  return prisma.returnExchange.create({
    data: {
      orderId: data.orderId,
      reason: data.reason,
      description: data.description,
      status: data.status ?? "solicitado",
    },
    include: { order: true },
  });
}

export async function updateReturnStatus(id: string, status: string) {
  const ret = await prisma.returnExchange.update({
    where: { id },
    data: { status },
    include: { order: true },
  });
  if (status === "concluido") {
    await prisma.order.update({
      where: { id: ret.orderId },
      data: { orderStatus: "trocado_devolvido" },
    });
  }
  return ret;
}
