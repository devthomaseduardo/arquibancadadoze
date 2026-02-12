import { Router } from "express";
import * as ordersService from "./orders.service.js";
import * as supplierCopy from "./supplier-copy.service.js";
import { adminAuth, authOptional, authRequired } from "../../shared/middlewares.js";
import { createOrderSchema } from "./orders.validation.js";
import { badRequest } from "../../shared/errors.js";
import type { JwtPayload } from "../auth/auth.service.js";

const router = Router();

// Cliente logado: meus pedidos (deve vir antes de /:id)
router.get("/me/orders", authRequired, async (req, res, next) => {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    const orders = await ordersService.getOrdersByUserId(user.userId);
    res.json({ orders });
  } catch (e) {
    next(e);
  }
});

// Rotas públicas (checkout/loja) - criar pedido (se logado, associa ao usuário)
router.post("/", authOptional, async (req, res, next) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      throw badRequest(msg || "Dados do pedido inválidos");
    }
    const user = (req as unknown as { user?: JwtPayload }).user;
    const order = await ordersService.createOrder({
      ...parsed.data,
      userId: user?.userId,
    });
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

// Rotas admin (listar, filtrar, detalhes, atualizar)
router.get("/", adminAuth, async (req, res, next) => {
  try {
    const filters: ordersService.OrderFilters = {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      orderStatus: req.query.orderStatus as string,
      paymentStatus: req.query.paymentStatus as string,
      customerName: req.query.customerName as string,
      orderNumber: req.query.orderNumber as string,
      orderId: req.query.orderId as string,
    };
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const offset = Number(req.query.offset) || 0;
    const data = await ordersService.listOrders(filters, limit, offset);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/by-number/:orderNumber", adminAuth, async (req, res, next) => {
  try {
    const data = await ordersService.getOrderByNumber(req.params.orderNumber);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", adminAuth, async (req, res, next) => {
  try {
    const data = await ordersService.getOrderById(req.params.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/:id/supplier-text", adminAuth, async (req, res, next) => {
  try {
    const text = await supplierCopy.getOrderTextForSupplier(req.params.id);
    res.json({ text });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", adminAuth, async (req, res, next) => {
  try {
    const data = await ordersService.updateOrderStatus(req.params.id, req.body);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/communications", adminAuth, async (req, res, next) => {
  try {
    const { type, content } = req.body;
    const data = await ordersService.addOrderCommunication(req.params.id, type, content);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
