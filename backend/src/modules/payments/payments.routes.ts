import { Router } from "express";
import * as mpService from "./mercadopago.service.js";
import { prisma } from "../../shared/prisma.js";
import { badRequest } from "../../shared/errors.js";

const router = Router();

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

    const baseUrl = (backUrlSuccess || "").replace(/\/[^/]*$/, "") || "http://localhost:8080";
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
      auto_return: "approved",
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

export default router;
