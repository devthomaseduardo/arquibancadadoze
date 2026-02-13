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

function adminHeaders() {
  const adminKey = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined)?.trim();
  return adminKey ? { "x-admin-key": adminKey } : undefined;
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
