import { prisma } from "../../shared/prisma.js";

export type MetricsPeriod = { dateFrom: Date; dateTo: Date } | null;

export async function getMetrics(period: MetricsPeriod = null) {
  const where = period
    ? {
        createdAt: {
          gte: period.dateFrom,
          lte: period.dateTo,
        },
      }
    : {};

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      totalAmount: true,
      totalCost: true,
      estimatedProfit: true,
      paymentStatus: true,
      orderStatus: true,
      addressState: true,
      paymentMethod: true,
      createdAt: true,
    },
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalCost = orders.reduce((s, o) => s + (o.totalCost ?? 0), 0);
  const totalProfit = orders.reduce((s, o) => s + (o.estimatedProfit ?? 0), 0);
  const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const byPaymentMethod: Record<string, { count: number; total: number }> = {};
  const byRegion: Record<string, { count: number; total: number }> = {};
  const byOrderStatus: Record<string, number> = {};
  const byPaymentStatus: Record<string, number> = {};

  for (const o of orders) {
    const pm = o.paymentMethod || "outro";
    if (!byPaymentMethod[pm]) byPaymentMethod[pm] = { count: 0, total: 0 };
    byPaymentMethod[pm].count += 1;
    byPaymentMethod[pm].total += o.totalAmount;

    const region = mapStateToRegion(o.addressState);
    if (!byRegion[region]) byRegion[region] = { count: 0, total: 0 };
    byRegion[region].count += 1;
    byRegion[region].total += o.totalAmount;

    byOrderStatus[o.orderStatus] = (byOrderStatus[o.orderStatus] ?? 0) + 1;
    byPaymentStatus[o.paymentStatus] = (byPaymentStatus[o.paymentStatus] ?? 0) + 1;
  }

  return {
    totalOrders,
    totalRevenue,
    totalCost,
    totalProfit,
    ticketMedio,
    byPaymentMethod,
    byRegion,
    byOrderStatus,
    byPaymentStatus,
    period: period
      ? { from: period.dateFrom.toISOString(), to: period.dateTo.toISOString() }
      : null,
  };
}

function mapStateToRegion(state: string): string {
  const s = (state || "").toUpperCase();
  const sudeste = ["SP", "RJ", "MG", "ES"];
  const sul = ["PR", "SC", "RS"];
  const nordeste = ["BA", "CE", "PE", "RN", "PB", "AL", "SE", "MA", "PI"];
  const norte = ["AM", "PA", "RO", "AC", "RR", "AP", "TO"];
  const centroOeste = ["DF", "GO", "MT", "MS"];
  if (sudeste.includes(s)) return "Sudeste";
  if (sul.includes(s)) return "Sul";
  if (nordeste.includes(s)) return "Nordeste";
  if (norte.includes(s)) return "Norte";
  if (centroOeste.includes(s)) return "Centro-Oeste";
  return "Outro";
}
