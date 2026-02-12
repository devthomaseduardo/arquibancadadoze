import { prisma } from "../../shared/prisma.js";
import * as XLSX from "xlsx";
import type { OrderFilters } from "../orders/orders.service.js";

export type ExportFormat = "csv" | "xlsx";

export async function getOrdersForExport(
  filters: OrderFilters = {},
  limit = 10000
) {
  const where: Record<string, unknown> = {};
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom)
      (where.createdAt as Record<string, Date>).gte = new Date(filters.dateFrom);
    if (filters.dateTo)
      (where.createdAt as Record<string, Date>).lte = new Date(filters.dateTo);
  }
  if (filters.orderStatus) where.orderStatus = filters.orderStatus;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
  if (filters.customerName) {
    where.customerName = { contains: filters.customerName };
  }
  if (filters.orderNumber) where.orderNumber = { contains: filters.orderNumber };

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return orders.map((o) => ({
    id: o.id,
    numero_pedido: o.orderNumber,
    data: o.createdAt.toISOString(),
    cliente: o.customerName,
    email: o.customerEmail,
    telefone: o.customerPhone,
    endereco: `${o.addressStreet}, ${o.addressNumber} - ${o.addressCity}/${o.addressState} - CEP ${o.addressZip}`,
    produtos: o.items
      .map(
        (i) =>
          `${i.productName} ${i.variation ? `(${i.variation})` : ""} x${i.quantity}`
      )
      .join("; "),
    subtotal: o.subtotal,
    frete_cobrado: o.shippingCost,
    frete_pago: o.shippingCostPaid,
    total_venda: o.totalAmount,
    custo_total: o.totalCost,
    lucro_estimado: o.estimatedProfit,
    forma_pagamento: o.paymentMethod,
    status_pagamento: o.paymentStatus,
    status_pedido: o.orderStatus,
    codigo_rastreio: o.trackingCode,
  }));
}

export function buildCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const line = (r: Record<string, unknown>) =>
    headers
      .map((h) => {
        const v = r[h];
        const s = v == null ? "" : String(v);
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      })
      .join(",");
  return [headers.join(","), ...rows.map(line)].join("\n");
}

export function buildXlsxBuffer(rows: Record<string, unknown>[]): Buffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
  return Buffer.from(
    XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  ) as Buffer;
}
