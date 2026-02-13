const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "";

export type ApiErrorPayload = {
  error?: string;
  code?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Erro na requisição (${response.status})`;
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      if (payload?.error) message = payload.error;
    } catch {
      // noop: usa mensagem padrão
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    priceMin: number;
    priceMax: number;
    imageUrl: string | null;
    sizes: string;
    active: boolean;
    sortOrder: number;
  }>;
};

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMin: number;
  priceMax: number;
  imageUrl: string | null;
  sizes: string;
  active: boolean;
  sortOrder: number;
  category: Pick<ApiCategory, "id" | "name" | "slug">;
};

export type ApiProductVariant = {
  id: string;
  productId: string;
  size: string;
  sku: string | null;
};

export type ApiProductDetail = Omit<ApiProduct, "category"> & {
  category: Pick<ApiCategory, "id" | "name" | "slug" | "description" | "imageUrl" | "active" | "sortOrder">;
  variants: ApiProductVariant[];
};

export type ApiShippingPolicy = {
  id: string;
  region: string;
  price: number;
  description: string | null;
};

export type ApiShippingQuote = {
  state: string;
  region: string;
  baseShipping: number;
  freeShippingThreshold: number;
  isFreeShipping: boolean;
  finalShippingCost: number;
  estimateDays: { min: number; max: number };
  policyDescription: string | null;
};

export type ApiFaq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type ApiConfigMap = Record<string, string>;

export type ApiOrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  variation: string | null;
  quantity: number;
  unitPrice: number;
  unitCost: number | null;
  lineTotal: number;
  lineCost: number | null;
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string;
  addressState: string;
  addressZip: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingCost: number;
  shippingCostPaid: number | null;
  totalAmount: number;
  totalCost: number | null;
  estimatedProfit: number | null;
  trackingCode: string | null;
  notes: string | null;
  items: ApiOrderItem[];
};

export type ApiListOrdersResponse = {
  orders: ApiOrder[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminSettingsResponse = {
  config: Record<string, string>;
  shippingPolicies: ApiShippingPolicy[];
};

export type SalesReportResponse = {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    freightRevenue: number;
    productsRevenue: number;
    approvedRevenue: number;
    averageTicket: number;
  };
  series: Array<{ period: string; orders: number; revenue: number; freight: number }>;
  topProducts: Array<{ productName: string; quantity: number; revenue: number }>;
  filters: { dateFrom: string | null; dateTo: string | null; groupBy: "day" | "month" };
};

export type CreateOrderPayload = {
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
};

export type CreateMercadoPagoDemoPayload = {
  customerName?: string;
  customerEmail?: string;
  itemTitle?: string;
  unitPrice?: number;
  quantity?: number;
  shippingCost?: number;
  backUrlSuccess?: string;
  backUrlFailure?: string;
  backUrlPending?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type MercadoPagoDemoResponse = {
  orderId: string;
  orderNumber: string;
  preferenceId: string;
  initPoint: string | null;
  sandboxInitPoint: string | null;
};

export type MercadoPagoPreferenceResponse = {
  preferenceId: string;
  initPoint: string | null;
  sandboxInitPoint: string | null;
};

export type MercadoPagoPublicKeyResponse = {
  publicKey: string;
};

export type MercadoPagoTransparentResponse = {
  orderId?: string;
  orderNumber?: string;
  paymentId: string | number | null;
  paymentStatus: "pendente" | "aprovado" | "estornado";
  statusDetail?: string | null;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  ticketUrl?: string | null;
};

export function getCategories() {
  return request<ApiCategory[]>("/api/categories");
}

export function getProducts(categorySlug?: string) {
  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<ApiProduct[]>(`/api/products${suffix}`);
}

export function getProductBySlug(slug: string) {
  return request<ApiProductDetail>(`/api/products/${slug}`);
}

export function createOrder(payload: CreateOrderPayload) {
  return request<ApiOrder>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createMercadoPagoDemoPurchase(payload: CreateMercadoPagoDemoPayload) {
  const headers = adminHeaders();
  if (!headers) {
    throw new Error("Chave admin ausente. Defina VITE_ADMIN_API_KEY ou localStorage.adminKey.");
  }

  return request<MercadoPagoDemoResponse>("/api/payments/mercadopago/demo", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export function createMercadoPagoPreference(payload: {
  orderId: string;
  backUrlSuccess?: string;
  backUrlFailure?: string;
  backUrlPending?: string;
}) {
  return request<MercadoPagoPreferenceResponse>("/api/payments/mercadopago/preference", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMercadoPagoPublicKey() {
  return request<MercadoPagoPublicKeyResponse>("/api/payments/mercadopago/public-key");
}

export function createMercadoPagoTransparentPayment(payload: {
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
  shippingCost: number;
  items: Array<{
    productId?: string;
    productName: string;
    variation?: string;
    quantity: number;
    unitPrice: number;
    unitCost?: number;
  }>;
  payment: {
    token?: string;
    paymentMethodId: string;
    installments?: number;
    issuerId?: string;
    payer?: {
      email?: string;
      identification?: { type?: string; number?: string };
    };
  };
}) {
  return request<MercadoPagoTransparentResponse>("/api/payments/mercadopago/transparent", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: { name: string; email: string; password: string }) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe(token: string) {
  return request<AuthUser>("/api/auth/me", {
    headers: authHeaders(token),
  });
}

export function loginWithGoogle(credential: string) {
  return request<AuthResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function getShippingPolicies() {
  return request<ApiShippingPolicy[]>("/api/content/shipping");
}

export function getShippingQuote(state: string, subtotal: number) {
  const params = new URLSearchParams({ state, subtotal: String(subtotal) });
  return request<ApiShippingQuote>(`/api/content/shipping/quote?${params.toString()}`);
}

export function getFaq() {
  return request<ApiFaq[]>("/api/content/faq");
}

export function getConfig(keys: string[]) {
  const params = new URLSearchParams({ keys: keys.join(",") });
  return request<ApiConfigMap>(`/api/content/config?${params.toString()}`);
}

function getRuntimeAdminKey(): string | undefined {
  // Prefer localStorage so admin possa digitar a chave sem rebuild
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("adminKey")?.trim();
    if (stored) return stored;
  }
  const envKey = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined)?.trim();
  return envKey || undefined;
}

function adminHeaders() {
  const adminKey = getRuntimeAdminKey();
  return adminKey ? { "x-admin-key": adminKey } : undefined;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function getAdminOrders() {
  return request<ApiListOrdersResponse>("/api/orders", { headers: adminHeaders() });
}

export function updateAdminOrder(
  id: string,
  payload: { orderStatus?: string; paymentStatus?: string; trackingCode?: string; notes?: string },
) {
  return request<ApiOrder>(`/api/orders/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
}

export function getAdminSupplierText(orderId: string) {
  return request<{ text: string }>(`/api/orders/${orderId}/supplier-text`, { headers: adminHeaders() });
}

export function getAdminSettings() {
  return request<AdminSettingsResponse>("/api/admin/settings", { headers: adminHeaders() });
}

export function updateAdminConfigKey(key: string, value: string) {
  return request<{ key: string; value: string }>(`/api/admin/settings/config/${key}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ value }),
  });
}

export function updateAdminShippingPolicy(region: string, payload: { price?: number; description?: string }) {
  return request<ApiShippingPolicy>(`/api/admin/settings/shipping/${encodeURIComponent(region)}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
}

export function getSalesReport(params?: { dateFrom?: string; dateTo?: string; groupBy?: "day" | "month" }) {
  const search = new URLSearchParams();
  if (params?.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params?.dateTo) search.set("dateTo", params.dateTo);
  if (params?.groupBy) search.set("groupBy", params.groupBy);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<SalesReportResponse>(`/api/admin/reports/sales${suffix}`, { headers: adminHeaders() });
}

export type MetricsResponse = {
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  ticketMedio: number;
  byPaymentMethod: Record<string, { count: number; total: number }>;
  byRegion: Record<string, { count: number; total: number }>;
  byOrderStatus: Record<string, number>;
  byPaymentStatus: Record<string, number>;
  period: { from: string; to: string } | null;
};

export function getMetrics(dateFrom?: string, dateTo?: string) {
  const search = new URLSearchParams();
  if (dateFrom) search.set("dateFrom", dateFrom);
  if (dateTo) search.set("dateTo", dateTo);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<MetricsResponse>(`/api/metrics${suffix}`, { headers: adminHeaders() });
}
