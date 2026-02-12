import { getOrderById } from "./orders.service.js";

/**
 * Gera texto formatado do pedido para enviar ao fornecedor (WhatsApp etc.)
 */
export async function getOrderTextForSupplier(orderId: string): Promise<string> {
  const order = await getOrderById(orderId);
  const lines: string[] = [
    `*Pedido ${order.orderNumber} - Torcida Urbana*`,
    "",
    "*Cliente:* " + order.customerName,
    "*Tel:* " + (order.customerPhone || "-"),
    "",
    "*Endereço:*",
    `${order.addressStreet}, ${order.addressNumber}`,
    order.addressComplement ? order.addressComplement : "",
    `${order.addressNeighborhood || ""} - ${order.addressCity}/${order.addressState}`,
    `CEP: ${order.addressZip}`,
    "",
    "*Itens:*",
  ];

  for (const item of order.items) {
    lines.push(
      `• ${item.productName} ${item.variation ? `- ${item.variation}` : ""} x${item.quantity}`
    );
  }

  lines.push("", "---", "Enviar para o endereço acima.");
  return lines.filter((l) => l !== "").join("\n");
}
