import { Router } from "express";
import * as mpService from "./mercadopago.service.js";
import { prisma } from "../../shared/prisma.js";
import { badRequest } from "../../shared/errors.js";
import { adminAuth } from "../../shared/middlewares.js";
import { env } from "../../config/env.js";
import * as ordersService from "../orders/orders.service.js";
import { ORDER_STATUS } from "../../config/constants.js";
import { z } from "zod";

const router = Router();

function getBaseUrlFromBackUrl(backUrl?: unknown) {
  if (typeof backUrl !== "string" || !backUrl) return "http://localhost:8080";
  try {
    return new URL(backUrl).origin;
  } catch {
    return "http://localhost:8080";
  }
}

/** Retorna a Public Key do MP para o frontend (tokenização de cartão). */
router.get("/mercadopago/public-key", (_req, res) => {
  const key = mpService.getPublicKey();
  res.json({ publicKey: key });
});

/** Cria preferência no Mercado Pago (PIX, boleto, etc.) e retorna link de pagamento. */
router.post("/mercadopago/preference", async (req, res, next) => {
  try {
    const { orderId, backUrlSuccess, backUrlFailure, backUrlPending } = req.body;
    if (!orderId) throw badRequest("orderId é obrigatório.");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw badRequest("Pedido não encontrado.");

    const baseUrl = getBaseUrlFromBackUrl(backUrlSuccess);
    const items = order.items.map((i) => ({
      title: i.productName + (i.variation ? ` (${i.variation})` : ""),
      quantity: i.quantity,
      unit_price: i.unitPrice,
    }));
    if (order.shippingCost > 0) {
      items.push({
        title: "Frete",
        quantity: 1,
        unit_price: order.shippingCost,
      });
    }
    const result = await mpService.createPreference({
      items,
      payer: { email: order.customerEmail, name: order.customerName },
      external_reference: orderId,
      back_urls: {
        success: backUrlSuccess || `${baseUrl}/loja.html?payment=success`,
        failure: backUrlFailure || `${baseUrl}/loja.html?payment=failure`,
        pending: backUrlPending || `${baseUrl}/loja.html?payment=pending`,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { mercadopagoPreferenceId: String(result.id) },
    });

    res.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * Cria uma preferência Mercado Pago (sem pedido) para facilitar testes da integração.
 * Protegido por `X-Admin-Key` e disponível apenas fora de produção.
 */
router.post("/mercadopago/demo-preference", adminAuth, async (req, res, next) => {
  try {
    if (env.NODE_ENV === "production") {
      throw badRequest("Endpoint demo indisponível em produção.");
    }

    const { itemTitle, unitPrice, quantity, customerEmail, customerName, backUrlSuccess, backUrlFailure, backUrlPending } =
      req.body ?? {};

    const baseUrl = getBaseUrlFromBackUrl(backUrlSuccess);
    const result = await mpService.createPreference({
      items: [
        {
          title: itemTitle || "Produto Demo (Teste)",
          quantity: Number.isFinite(Number(quantity)) ? Number(quantity) : 1,
          unit_price: Number.isFinite(Number(unitPrice)) ? Number(unitPrice) : 149.9,
        },
      ],
      payer: {
        email: customerEmail || "cliente.demo@exemplo.com",
        name: customerName || "Cliente Demo",
      },
      external_reference: `demo-${Date.now()}`,
      back_urls: {
        success: backUrlSuccess || `${baseUrl}/loja.html?payment=success`,
        failure: backUrlFailure || `${baseUrl}/loja.html?payment=failure`,
        pending: backUrlPending || `${baseUrl}/loja.html?payment=pending`,
      },
    });

    res.status(201).json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * Cria uma compra demo (pedido + preferência Mercado Pago) para facilitar testes locais.
 * Protegido por `X-Admin-Key` e disponível apenas fora de produção.
 */
router.post("/mercadopago/demo", adminAuth, async (req, res, next) => {
  try {
    if (env.NODE_ENV === "production") {
      throw badRequest("Endpoint demo indisponível em produção.");
    }

    const {
      customerEmail,
      customerName,
      itemTitle,
      unitPrice,
      quantity,
      shippingCost,
      backUrlSuccess,
      backUrlFailure,
      backUrlPending,
    } = req.body ?? {};

    const order = await ordersService.createOrder({
      customerName: customerName || "Cliente Demo",
      customerEmail: customerEmail || "cliente.demo@exemplo.com",
      customerPhone: "11999999999",
      addressStreet: "Rua Demo",
      addressNumber: "123",
      addressComplement: "Apto 1",
      addressNeighborhood: "Centro",
      addressCity: "São Paulo",
      addressState: "SP",
      addressZip: "01001000",
      paymentMethod: "mercadopago",
      items: [
        {
          productName: itemTitle || "Camisa Demo (Teste)",
          variation: "M",
          quantity: Number.isFinite(Number(quantity)) ? Number(quantity) : 1,
          unitPrice: Number.isFinite(Number(unitPrice)) ? Number(unitPrice) : 149.9,
        },
      ],
      shippingCost: Number.isFinite(Number(shippingCost)) ? Number(shippingCost) : 35,
      notes: "Pedido DEMO criado para teste do Mercado Pago",
      source: "demo",
    });

    const baseUrl = getBaseUrlFromBackUrl(backUrlSuccess);
    const result = await mpService.createPreference({
      items: order.items.map((i) => ({
        title: i.productName + (i.variation ? ` (${i.variation})` : ""),
        quantity: i.quantity,
        unit_price: i.unitPrice,
      })),
      payer: { email: order.customerEmail, name: order.customerName },
      external_reference: order.id,
      back_urls: {
        success: backUrlSuccess || `${baseUrl}/loja.html?payment=success`,
        failure: backUrlFailure || `${baseUrl}/loja.html?payment=failure`,
        pending: backUrlPending || `${baseUrl}/loja.html?payment=pending`,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { mercadopagoPreferenceId: String(result.id) },
    });

    res.status(201).json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * Webhook Mercado Pago: atualiza status do pedido baseado no pagamento.
 * Deve ser configurado no painel do MP.
 */
router.post("/mercadopago/webhook", async (req, res, next) => {
  try {
    const body = req.body as { type?: string; data?: { id?: string | number } };
    const idFromBody = body?.data?.id ? String(body.data.id) : null;
    const idFromQuery = req.query["data.id"] ? String(req.query["data.id"]) : null;
    const paymentId = idFromBody || idFromQuery;

    if (!paymentId) {
      return res.status(200).json({ received: true });
    }

    const payment = await mpService.getPaymentById(paymentId);
    const orderId = payment.external_reference;
    if (!orderId) {
      return res.status(200).json({ received: true });
    }

    const mappedStatus = mpService.mapMpStatus(payment.status);
    const existingOrder = await prisma.order.findUnique({ where: { id: String(orderId) } });
    if (!existingOrder) return res.status(200).json({ received: true });

    const nextStatus =
      mappedStatus === "aprovado" && existingOrder.orderStatus === ORDER_STATUS.AWAITING
        ? ORDER_STATUS.PICKING
        : undefined;

    await prisma.order.update({
      where: { id: String(orderId) },
      data: {
        paymentStatus: mappedStatus,
        mercadopagoPaymentId: String(payment.id ?? paymentId),
        orderStatus: nextStatus,
      },
    });

    return res.status(200).json({ received: true });
  } catch (e) {
    next(e);
  }
});

/** Processa pagamento com cartão (token do frontend). */
router.post("/mercadopago/card", async (req, res, next) => {
  try {
    const { orderId, token, paymentMethodId, installments } = req.body;
    if (!orderId || !token || !paymentMethodId) {
      throw badRequest("orderId, token e paymentMethodId são obrigatórios.");
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw badRequest("Pedido não encontrado.");

    const result = await mpService.createPayment({
      transaction_amount: order.totalAmount,
      token,
      payment_method_id: paymentMethodId,
      payer: { email: order.customerEmail },
      description: `Pedido ${order.orderNumber}`,
      external_reference: orderId,
      installments: installments ? Number(installments) : 1,
    });

    const paymentStatus =
      result.status === "approved" ? "aprovado" : result.status === "pending" ? "pendente" : "pendente";
    await prisma.order.update({
      where: { id: orderId },
      data: {
        mercadopagoPaymentId: String(result.id),
        paymentStatus,
      },
    });

    res.json({
      paymentId: result.id,
      status: result.status,
      paymentStatus,
    });
  } catch (e) {
    next(e);
  }
});

const transparentSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  addressStreet: z.string().min(2),
  addressNumber: z.string().min(1),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().min(2),
  addressState: z.string().min(2),
  addressZip: z.string().min(5),
  shippingCost: z.number().nonnegative(),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      productName: z.string().min(1),
      variation: z.string().optional(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      unitCost: z.number().optional(),
    }),
  ).min(1),
  payment: z.object({
    token: z.string().optional(),
    paymentMethodId: z.string().min(1),
    installments: z.number().int().positive().optional(),
    issuerId: z.string().optional(),
    payer: z.object({
      email: z.string().email().optional(),
      identification: z.object({
        type: z.string().optional(),
        number: z.string().optional(),
      }).optional(),
    }).optional(),
  }),
});

router.post("/mercadopago/transparent", async (req, res, next) => {
  try {
    const parsed = transparentSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      throw badRequest(msg || "Dados inválidos para pagamento.");
    }

    const payload = parsed.data;
    const productIds = payload.items.map((item) => item.productId).filter(Boolean) as string[];
    if (productIds.length) {
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((p) => [p.id, p]));
      for (const item of payload.items) {
        if (!item.productId) continue;
        const product = productMap.get(item.productId);
        if (!product) throw badRequest("Produto inválido.");
        if (item.unitPrice < product.priceMin || item.unitPrice > product.priceMax) {
          throw badRequest("Preço do item inválido.");
        }
      }
    }

    const subtotal = payload.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalAmount = subtotal + payload.shippingCost;

    const paymentResult = await mpService.createPayment({
      transaction_amount: totalAmount,
      token: payload.payment.token,
      payment_method_id: payload.payment.paymentMethodId,
      payer: {
        email: payload.payment.payer?.email || payload.customerEmail,
        identification: payload.payment.payer?.identification,
      },
      description: `Compra Arquibancada 12`,
      installments: payload.payment.installments,
      issuer_id: payload.payment.issuerId,
    });

    const mappedStatus = mpService.mapMpStatus(paymentResult.status);
    if (mappedStatus === "estornado") {
      return res.status(402).json({
        paymentId: paymentResult.id ?? null,
        paymentStatus: mappedStatus,
        statusDetail: paymentResult.status_detail ?? null,
      });
    }

    const order = await ordersService.createOrder({
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      addressStreet: payload.addressStreet,
      addressNumber: payload.addressNumber,
      addressComplement: payload.addressComplement,
      addressNeighborhood: payload.addressNeighborhood,
      addressCity: payload.addressCity,
      addressState: payload.addressState.toUpperCase(),
      addressZip: payload.addressZip,
      paymentMethod: paymentResult.payment_type_id || payload.payment.paymentMethodId,
      paymentStatus: mappedStatus,
      orderStatus: ORDER_STATUS.AWAITING,
      items: payload.items,
      shippingCost: payload.shippingCost,
      source: "frontend-checkout-transparent",
      mercadopagoPaymentId: paymentResult.id ? String(paymentResult.id) : undefined,
    });

    res.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId: paymentResult.id ?? null,
      paymentStatus: mappedStatus,
      statusDetail: paymentResult.status_detail ?? null,
      pixQrCode: paymentResult.qr_code ?? null,
      pixQrCodeBase64: paymentResult.qr_code_base64 ?? null,
      ticketUrl: paymentResult.ticket_url ?? null,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
