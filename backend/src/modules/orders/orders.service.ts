import { prisma } from "../../shared/prisma.js";
import { notFound } from "../../shared/errors.js";
import type { Prisma } from "@prisma/client";
import { sendMail } from "../../shared/email.js";

async function sendOrderCreatedEmail(order: { orderNumber: string; customerEmail: string; customerName: string }) {
  // Email nao pode quebrar criacao de pedido: erros sao tratados pelo caller.
  await sendMail({
    to: order.customerEmail,
    subject: `Pedido recebido #${order.orderNumber} - Arquibancada 12`,
    text: `Ola ${order.customerName}, recebemos seu pedido #${order.orderNumber}. Em breve voce recebera atualizacoes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">Pedido recebido</h2>
        <p style="margin: 0 0 8px;">Ola <strong>${order.customerName}</strong>, recebemos seu pedido <strong>#${order.orderNumber}</strong>.</p>
        <p style="margin: 0;">Em breve voce recebera atualizacoes do despacho e rastreio.</p>
      </div>
    `,
  });
}

export type OrderFilters = {
  dateFrom?: string; // ISO date
  dateTo?: string;
  orderStatus?: string;
  paymentStatus?: string;
  customerName?: string;
  orderNumber?: string;
  orderId?: string;
};

export async function listOrders(filters: OrderFilters = {}, limit = 100, offset = 0) {
  const where: Prisma.OrderWhereInput = {};

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(filters.dateFrom);
    if (filters.dateTo) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(filters.dateTo);
  }
  if (filters.orderStatus) where.orderStatus = filters.orderStatus;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
  if (filters.customerName) {
    where.customerName = { contains: filters.customerName };
  }
  if (filters.orderNumber) {
    where.orderNumber = { contains: filters.orderNumber };
  }
  if (filters.orderId) where.id = filters.orderId;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        returns: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, limit, offset };
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      communications: { orderBy: { createdAt: "desc" } },
      returns: true,
    },
  });
  if (!order) throw notFound("Pedido não encontrado");
  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, communications: true, returns: true },
  });
  if (!order) throw notFound("Pedido não encontrado");
  return order;
}

export async function getNextOrderNumber(): Promise<string> {
  const last = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });
  if (!last) return "1001";
  const num = parseInt(last.orderNumber.replace(/\D/g, ""), 10) || 1000;
  return String(num + 1);
}


export async function createOrder(data: {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  paymentMethod: string;
  paymentStatus?: string;
  orderStatus?: string;
  items: Array<{
    productId?: string;
    productName: string;
    variation?: string;
    quantity: number;
    unitPrice: number;
    unitCost?: number;
  }>;
  shippingCost: number;
  shippingCostPaid?: number;
  notes?: string;
  source?: string;
  externalId?: string;
  mercadopagoPaymentId?: string;
  mercadopagoPreferenceId?: string;
  couponCode?: string;
}) {
  // 1. Preparar validações e cálculos
  let influencerId: string | undefined;
  let commissionRate = 0;
  let accumulatedMinMargin = 0; // Para simplificar, usaremos a maior margem exigida entre os produtos ou 20%
  let loadedItems: any[] = []; // Guardar dados enriquecidos

  // Validar Cupom/Influenciador
  if (data.couponCode) {
    const influencer = await prisma.influencer.findUnique({
      where: { couponCode: data.couponCode, active: true },
    });
    if (influencer) {
      influencerId = influencer.id;
      commissionRate = influencer.commissionRate;
    }
  }

  // 1.1 Validar estoque e Carregar dados de Custo/Margem
  for (const item of data.items) {
    if (item.productId && item.variation) {
      const variant = await prisma.productVariant.findFirst({
        where: { productId: item.productId, size: item.variation },
        include: { product: { include: { category: true } } }
      });
      if (!variant) {
        // Quando nao ha variantes cadastradas para o produto (seed/operacao sem controle de estoque),
        // nao bloqueamos o checkout. Mantemos os dados enviados pelo frontend.
        loadedItems.push(item);
        if (accumulatedMinMargin === 0) accumulatedMinMargin = 20; // Default
        continue;
      }
      if (variant.quantity < item.quantity) {
        throw new Error(`Estoque insuficiente para ${item.productName} tamanho ${item.variation}. Disponível: ${variant.quantity}`);
      }

      // Lógica de Margem Mínima
      let itemMinMargin = variant.product.minimumMargin;

      // Verificar campanhas ativas para essa categoria
      const now = new Date();
      const campaign = await prisma.campaign.findFirst({
        where: {
          active: true,
          startDate: { lte: now },
          endDate: { gte: now },
          targetCategorySlug: variant.product.category.slug
        }
      });

      if (campaign && campaign.minMarginOverride != null) {
        itemMinMargin = campaign.minMarginOverride;
      }

      if (itemMinMargin > accumulatedMinMargin) accumulatedMinMargin = itemMinMargin;

      // Enforce cost retrieval from DB if not provided (Safety)
      const cost = item.unitCost ?? variant.product.costMax;

      loadedItems.push({ ...item, unitCost: cost });

    } else {
      // Itens sem ID (manuais?): assumir dados passados
      loadedItems.push(item);
      if (accumulatedMinMargin === 0) accumulatedMinMargin = 20; // Default
    }
  }

  // 2. Cálculos Financeiros Globais
  const subtotal = loadedItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalAmount = subtotal + data.shippingCost;

  // Custos
  const productsCost = loadedItems.reduce((s, i) => s + (i.unitCost ?? 0) * i.quantity, 0);
  const totalCost = productsCost + (data.shippingCostPaid ?? 0);

  // Taxas
  const platformFee = totalAmount * 0.10; // 10% Platform Fee (Hardcoded for MVP)
  const commissionValue = subtotal * (commissionRate / 100);

  // Lucro e Margem
  const estimatedProfit = totalAmount - totalCost;
  const netProfit = totalAmount - totalCost - platformFee - commissionValue;
  const netMarginPercent = totalAmount > 0 ? (netProfit / totalAmount) * 100 : 0;

  // 2.1 Bloqueio de Segurança de Margem
  if (netMarginPercent < accumulatedMinMargin) {
    throw new Error(`Pedido bloqueado: Margem líquida (${netMarginPercent.toFixed(2)}%) abaixo do mínimo exigido (${accumulatedMinMargin}%). Lucro projetado: R$ ${netProfit.toFixed(2)}`);
  }

  // 3. Criar pedido e descontar estoque em transação
  const result = await prisma.$transaction(async (tx) => {
    // Descontar estoque
    for (const item of data.items) {
      if (item.productId && item.variation) {
        await tx.productVariant.updateMany({
          where: { productId: item.productId, size: item.variation },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    const orderNumber = await getNextOrderNumber();

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        addressStreet: data.addressStreet,
        addressNumber: data.addressNumber,
        addressComplement: data.addressComplement,
        addressNeighborhood: data.addressNeighborhood,
        addressCity: data.addressCity,
        addressState: data.addressState,
        addressZip: data.addressZip,
        subtotal,
        shippingCost: data.shippingCost,
        shippingCostPaid: data.shippingCostPaid,
        totalAmount,
        totalCost,
        estimatedProfit, // Mantendo campo legado preenchido com netProfit ou calculated

        // Novos Campos Financeiros
        platformFee,
        commissionValue,
        netProfit,
        netMarginPercent,
        influencerId,
        appliedCoupon: data.couponCode,

        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus ?? "pendente",
        orderStatus: data.orderStatus ?? "aguardando",
        notes: data.notes,
        source: data.source,
        externalId: data.externalId,
        mercadopagoPaymentId: data.mercadopagoPaymentId,
        mercadopagoPreferenceId: data.mercadopagoPreferenceId,
        items: {
          create: loadedItems.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            variation: i.variation,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            unitCost: i.unitCost,
            lineTotal: i.quantity * i.unitPrice,
            lineCost: i.unitCost != null ? i.quantity * i.unitCost : null,
          })),
        },
      },
      include: { items: true },
    });
    return order;
  });

  try {
    await sendOrderCreatedEmail({
      orderNumber: result.orderNumber,
      customerEmail: result.customerEmail,
      customerName: result.customerName,
    });
  } catch (e) {
    // Falha de email nao deve impedir checkout.
    console.error("Falha ao enviar email de pedido criado:", e);
  }

  return result;
}

export async function updateOrderStatus(
  id: string,
  updates: { orderStatus?: string; paymentStatus?: string; trackingCode?: string; trackingUrl?: string; notes?: string; shippedAt?: Date }
) {
  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(updates.orderStatus != null && { orderStatus: updates.orderStatus }),
      ...(updates.paymentStatus != null && { paymentStatus: updates.paymentStatus }),
      ...(updates.trackingCode != null && { trackingCode: updates.trackingCode }),
      ...(updates.trackingUrl != null && { trackingUrl: updates.trackingUrl }),
      ...(updates.notes != null && { notes: updates.notes }),
      ...(updates.shippedAt != null && { shippedAt: updates.shippedAt }),
    },
    include: { items: true, communications: true, returns: true },
  });
  return order;
}

export async function addOrderCommunication(orderId: string, type: string, content: string) {
  return prisma.orderCommunication.create({
    data: { orderId, type, content },
  });
}

/** Pedidos do cliente logado (por userId ou e-mail do usuário) */
export async function getOrdersByUserId(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return [];
  const orders = await prisma.order.findMany({
    where: {
      OR: [{ userId }, { customerEmail: user.email }],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders;
}
