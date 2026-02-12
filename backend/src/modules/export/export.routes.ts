import { Router } from "express";
import * as exportService from "./export.service.js";
import { adminAuth } from "../../shared/middlewares.js";
import type { OrderFilters } from "../orders/orders.service.js";

const router = Router();

router.get("/orders", adminAuth, async (req, res, next) => {
  try {
    const filters: OrderFilters = {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      orderStatus: req.query.orderStatus as string,
      paymentStatus: req.query.paymentStatus as string,
      customerName: req.query.customerName as string,
      orderNumber: req.query.orderNumber as string,
    };
    const limit = Math.min(Number(req.query.limit) || 5000, 10000);
    const rows = await exportService.getOrdersForExport(filters, limit);

    const format = (req.query.format as string) || "csv";

    if (format === "xlsx") {
      const buffer = exportService.buildXlsxBuffer(rows);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=pedidos-torcida-urbana-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(buffer);
      return;
    }

    const csv = exportService.buildCsv(rows);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=pedidos-torcida-urbana-${new Date().toISOString().slice(0, 10)}.csv`
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.send("\uFEFF" + csv); // BOM para Excel em PT-BR
  } catch (e) {
    next(e);
  }
});

export default router;
