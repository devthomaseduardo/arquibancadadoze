import { prisma } from "../../shared/prisma.js";

export type SalesReportFilters = {
  dateFrom?: string;
  dateTo?: string;
  groupBy?: "day" | "month";
};

export async function getSalesReport(filters: SalesReportFilters) {
  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const freightRevenue = orders.reduce((s, o) => s + o.shippingCost, 0);
  const productsRevenue = totalRevenue - freightRevenue;
  const approvedRevenue = orders
    .filter((o) => o.paymentStatus === "aprovado")
    .reduce((s, o) => s + o.totalAmount, 0);

  const bucketFmt = filters.groupBy === "month" ? "month" : "day";
  const seriesMap = new Map<string, { period: string; orders: number; revenue: number; freight: number }>();
  const topProductsMap = new Map<string, { productName: string; quantity: number; revenue: number }>();

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const period =
      bucketFmt === "month"
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const current = seriesMap.get(period) ?? { period, orders: 0, revenue: 0, freight: 0 };
    current.orders += 1;
    current.revenue += order.totalAmount;
    current.freight += order.shippingCost;
    seriesMap.set(period, current);

    for (const item of order.items) {
      const row = topProductsMap.get(item.productName) ?? { productName: item.productName, quantity: 0, revenue: 0 };
      row.quantity += item.quantity;
      row.revenue += item.lineTotal;
      topProductsMap.set(item.productName, row);
    }
  }

  const series = [...seriesMap.values()].sort((a, b) => a.period.localeCompare(b.period));
  const topProducts = [...topProductsMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 15);

  return {
    summary: {
      totalOrders,
      totalRevenue,
      freightRevenue,
      productsRevenue,
      approvedRevenue,
      averageTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    },
    series,
    topProducts,
    filters: {
      dateFrom: filters.dateFrom ?? null,
      dateTo: filters.dateTo ?? null,
      groupBy: bucketFmt,
    },
  };
}
