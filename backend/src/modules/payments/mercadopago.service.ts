import { env } from "../../config/env.js";

const MP_BASE = "https://api.mercadopago.com";

function getHeaders() {
  const token = env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Cria preferência de pagamento (PIX, boleto, redirecionamento). Retorna link de pagamento e preference_id. */
export async function createPreference(params: {
  items: Array< { title: string; quantity: number; unit_price: number; currency_id?: string } >;
  payer: { email: string; name?: string };
  external_reference?: string;
  back_urls?: { success: string; failure: string; pending: string };
  auto_return?: "approved" | "all";
}) {
  const body: Record<string, unknown> = {
    items: params.items.map((i) => ({
      title: i.title,
      quantity: i.quantity,
      unit_price: i.unit_price,
      currency_id: i.currency_id || "BRL",
    })),
    payer: {
      email: params.payer.email,
      name: params.payer.name,
    },
    external_reference: params.external_reference,
    back_urls: params.back_urls,
  };
  if (params.auto_return) body.auto_return = params.auto_return;
  const res = await fetch(`${MP_BASE}/checkout/preferences`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { status?: number; message?: string; id?: string; init_point?: string; sandbox_init_point?: string };
  if (data.status && data.status >= 400) {
    throw new Error(data.message || "Erro ao criar preferência no Mercado Pago.");
  }
  return {
    id: data.id,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  };
}

/** Cria pagamento com cartão (token obtido no front com SDK do MP). */
export async function createPayment(params: {
  transaction_amount: number;
  token: string;
  payment_method_id: string;
  payer: { email: string };
  description?: string;
  external_reference?: string;
  installments?: number;
}) {
  const body = {
    transaction_amount: params.transaction_amount,
    token: params.token,
    payment_method_id: params.payment_method_id,
    payer: { email: params.payer.email },
    description: params.description,
    external_reference: params.external_reference,
    installments: params.installments || 1,
  };
  const res = await fetch(`${MP_BASE}/v1/payments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    status?: number | string;
    message?: string;
    error?: { message?: string };
    id?: number | string;
    status_detail?: string;
  };
  if (typeof data.status === "number" && data.status >= 400) {
    throw new Error(data.message || data.error?.message || "Erro ao processar pagamento.");
  }
  return {
    id: data.id,
    status: String(data.status ?? ""),
    status_detail: data.status_detail,
  };
}

/** Retorna a chave pública para usar no frontend (tokenização de cartão). */
export function getPublicKey(): string {
  return env.MERCADOPAGO_PUBLIC_KEY || "";
}
