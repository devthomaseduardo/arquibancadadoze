import { FormEvent, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, X, ChevronDown, Settings, BarChart3, ShoppingBag,
  Truck, PackageCheck, Send, CheckCircle2, Copy, Package,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminOrders, getAdminOrderDetail, updateAdminOrder, addAdminOrderCommunication,
  downloadAdminExportOrders,
  getAdminProducts,
  type ApiOrder, type ApiOrderDetail, type ApiAdminProduct,
  getSalesReport, getAdminSettings, updateAdminConfigKey,
  updateAdminShippingPolicy, getAdminSupplierText, getMetrics,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, string> = {
  aguardando: "Aguardando", em_separacao: "Em Separação",
  enviado: "Enviado", entregue: "Entregue", trocado_devolvido: "Trocado/Devolvido",
};
const statusColors: Record<string, string> = {
  aguardando: "bg-accent/20 text-accent", em_separacao: "bg-primary/20 text-primary",
  enviado: "bg-blue-500/20 text-blue-400", entregue: "bg-green-500/20 text-green-400",
  trocado_devolvido: "bg-destructive/20 text-destructive",
};
const paymentLabels: Record<string, string> = {
  pendente: "Pendente", aprovado: "Aprovado", estornado: "Estornado",
};
const paymentColors: Record<string, string> = {
  pendente: "bg-accent/20 text-accent", aprovado: "bg-green-500/20 text-green-400",
  estornado: "bg-destructive/20 text-destructive",
};

const CHART_COLORS = ["hsl(45,100%,50%)", "hsl(38,100%,55%)", "hsl(200,80%,55%)", "hsl(140,60%,50%)", "hsl(0,80%,60%)", "hsl(280,60%,60%)"];

const asCurrency = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;
const getOrderCost = (order: ApiOrder) => order.items.reduce((sum, i) => sum + (i.unitCost ?? 0) * i.quantity, 0);
const getProfit = (order: ApiOrder) => {
  const cost = order.totalCost ?? getOrderCost(order) + (order.shippingCostPaid ?? 0);
  return order.totalAmount - cost;
};
const buildCustomerAddress = (order: ApiOrder) => {
  return [
    `${order.addressStreet}, ${order.addressNumber}`,
    order.addressComplement || "", order.addressNeighborhood || "",
    `${order.addressCity}/${order.addressState}`, `CEP ${order.addressZip}`,
  ].filter(Boolean).join(" - ");
};

const logisticsColumns = [
  { key: "aguardando", label: "Aguardando", icon: ShoppingBag },
  { key: "em_separacao", label: "Em Separação", icon: PackageCheck },
  { key: "enviado", label: "Enviado", icon: Send },
  { key: "entregue", label: "Entregue", icon: CheckCircle2 },
] as const;

const logisticsSlaHours: Record<string, number> = {
  aguardando: 24,
  em_separacao: 36,
  enviado: 120,
  entregue: Number.POSITIVE_INFINITY,
};

const getOrderAgeHours = (order: ApiOrder) => {
  const createdAt = new Date(order.createdAt).getTime();
  return Math.max(0, (Date.now() - createdAt) / (1000 * 60 * 60));
};

const getLogisticsPriority = (order: ApiOrder) => {
  const slaHours = logisticsSlaHours[order.orderStatus] ?? 48;
  if (!Number.isFinite(slaHours)) return "no_prazo" as const;
  const ageHours = getOrderAgeHours(order);
  if (ageHours > slaHours) return "atrasado" as const;
  if (ageHours > slaHours * 0.7) return "atencao" as const;
  return "no_prazo" as const;
};

const logisticsPriorityConfig = {
  atrasado: { label: "Atrasado", className: "bg-red-500/20 text-red-400" },
  atencao: { label: "Atenção", className: "bg-amber-500/20 text-amber-400" },
  no_prazo: { label: "No prazo", className: "bg-green-500/20 text-green-400" },
} as const;

const logisticsPriorityOrder = { atrasado: 0, atencao: 1, no_prazo: 2 } as const;

const CHANNEL_LABELS: Record<string, string> = { site: "Site", shopee: "Shopee", ml: "Mercado Livre", amazon: "Amazon" };
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const Admin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<"pedidos" | "logistica" | "metricas" | "relatorios" | "produtos" | "config">("pedidos");
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [adminKey, setAdminKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminKey");
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [paymentFilter, setPaymentFilter] = useState<string>("todos");
  const [channelFilter, setChannelFilter] = useState<string>("todos");
  const [regionFilter, setRegionFilter] = useState<string>("todos");
  const [needsShippingOnly, setNeedsShippingOnly] = useState(false);
  const [orderSort, setOrderSort] = useState<"recent" | "value_desc" | "profit_desc" | "pending">("recent");
  const [ordersDateFrom, setOrdersDateFrom] = useState("");
  const [ordersDateTo, setOrdersDateTo] = useState("");
  const [logisticsSearch, setLogisticsSearch] = useState("");
  const [logisticsStatusFilter, setLogisticsStatusFilter] = useState<string>("todos");
  const [logisticsPriorityFilter, setLogisticsPriorityFilter] = useState<"todos" | "atrasado" | "atencao" | "no_prazo">("todos");
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("");
  const [editingTracking, setEditingTracking] = useState("");

  const [groupBy, setGroupBy] = useState<"day" | "month">("day");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [metricsDateFrom, setMetricsDateFrom] = useState("");
  const [metricsDateTo, setMetricsDateTo] = useState("");

  const [freeShippingThreshold, setFreeShippingThreshold] = useState("500");
  const [copyingSupplierId, setCopyingSupplierId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [newCommunication, setNewCommunication] = useState("");
  const [exportingFormat, setExportingFormat] = useState<"csv" | "xlsx" | null>(null);

  const ordersFilters = useMemo(() => ({
    dateFrom: ordersDateFrom || undefined,
    dateTo: ordersDateTo || undefined,
    orderStatus: statusFilter !== "todos" ? statusFilter : undefined,
    paymentStatus: paymentFilter !== "todos" ? paymentFilter : undefined,
    channel: channelFilter !== "todos" ? channelFilter : undefined,
    region: regionFilter !== "todos" ? regionFilter : undefined,
    needsShipping: needsShippingOnly || undefined,
    sort: orderSort,
    customerName: search.trim() ? search.trim() : undefined,
    orderNumber: search.trim() && /^\d+$/.test(search.trim()) ? search.trim() : undefined,
  }), [ordersDateFrom, ordersDateTo, statusFilter, paymentFilter, channelFilter, regionFilter, needsShippingOnly, orderSort, search]);

  const setPeriodPreset = (preset: "hoje" | "7dias" | "mes") => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    if (preset === "hoje") {
      setOrdersDateFrom(today.toISOString().slice(0, 10));
      setOrdersDateTo(today.toISOString().slice(0, 10));
    } else if (preset === "7dias") {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      setOrdersDateFrom(start.toISOString().slice(0, 10));
      setOrdersDateTo(today.toISOString().slice(0, 10));
    } else {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setOrdersDateFrom(start.toISOString().slice(0, 10));
      setOrdersDateTo(today.toISOString().slice(0, 10));
    }
  };

  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["admin-orders", ordersFilters],
    queryFn: () => getAdminOrders(ordersFilters),
    enabled: Boolean(adminKey),
  });

  const { data: orderDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["admin-order-detail", selectedOrder?.id],
    queryFn: () => getAdminOrderDetail(selectedOrder!.id),
    enabled: Boolean(adminKey && selectedOrder?.id),
  });
  const { data: reportData, isLoading: loadingReport } = useQuery({
    queryKey: ["admin-report", groupBy, dateFrom, dateTo],
    queryFn: () => getSalesReport({ groupBy, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
    enabled: Boolean(adminKey),
  });
  const { data: settingsData, isLoading: loadingSettings } = useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettings, enabled: Boolean(adminKey) });
  const { data: metricsData, isLoading: loadingMetrics } = useQuery({
    queryKey: ["admin-metrics", metricsDateFrom, metricsDateTo],
    queryFn: () => getMetrics(metricsDateFrom || undefined, metricsDateTo || undefined),
    enabled: Boolean(adminKey),
  });
  const { data: adminProducts = [], isLoading: loadingAdminProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getAdminProducts(),
    enabled: Boolean(adminKey) && tab === "produtos",
  });

  const saveOrderMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { orderStatus?: string; paymentStatus?: string; trackingCode?: string; notes?: string } }) => updateAdminOrder(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-detail", id] });
    },
  });
  const addCommMutation = useMutation({
    mutationFn: ({ orderId, type, content }: { orderId: string; type: string; content: string }) => addAdminOrderCommunication(orderId, type, content),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-order-detail", orderId] });
    },
  });
  const saveThresholdMutation = useMutation({
    mutationFn: (value: string) => updateAdminConfigKey("free_shipping_threshold", value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
  const saveShippingMutation = useMutation({
    mutationFn: ({ region, price, description }: { region: string; price: number; description: string }) => updateAdminShippingPolicy(region, { price, description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  const orders = ordersData?.orders ?? [];
  const filtered = orders;

  const logisticsBase = useMemo(() => orders.filter((order) => logisticsColumns.some((c) => c.key === order.orderStatus)), [orders]);
  const logisticsFiltered = useMemo(() => {
    let result = logisticsBase;
    if (logisticsStatusFilter !== "todos") result = result.filter((o) => o.orderStatus === logisticsStatusFilter);
    if (logisticsPriorityFilter !== "todos") result = result.filter((o) => getLogisticsPriority(o) === logisticsPriorityFilter);
    if (logisticsSearch) {
      const q = logisticsSearch.toLowerCase();
      result = result.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.addressState.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      const priorityDiff = logisticsPriorityOrder[getLogisticsPriority(a)] - logisticsPriorityOrder[getLogisticsPriority(b)];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [logisticsBase, logisticsPriorityFilter, logisticsSearch, logisticsStatusFilter]);

  const logisticsLateCount = useMemo(() => logisticsBase.filter((order) => getLogisticsPriority(order) === "atrasado").length, [logisticsBase]);
  const logisticsAttentionCount = useMemo(() => logisticsBase.filter((order) => getLogisticsPriority(order) === "atencao").length, [logisticsBase]);

  const openDetail = (order: ApiOrder) => {
    setSelectedOrder(order);
    setEditingStatus(order.orderStatus);
    setEditingTracking(order.trackingCode || "");
    setEditingNotes(order.notes || "");
    setNewCommunication("");
  };
  const saveOrderChanges = () => {
    if (!selectedOrder) return;
    saveOrderMutation.mutate({
      id: selectedOrder.id,
      payload: { orderStatus: editingStatus, trackingCode: editingTracking || undefined, notes: editingNotes || undefined },
    });
  };
  const addCommunication = () => {
    if (!selectedOrder?.id || !newCommunication.trim()) return;
    addCommMutation.mutate({ orderId: selectedOrder.id, type: "interno", content: newCommunication.trim() }, {
      onSuccess: () => setNewCommunication(""),
    });
  };
  const updateOrderStatusQuick = (order: ApiOrder, targetStatus: string) => {
    const trackingCode = (trackingDrafts[order.id] || order.trackingCode || "").trim();
    if (targetStatus === "enviado" && trackingCode.length < 5) {
      toast({ title: "Rastreio obrigatório", description: "Informe o código de rastreio antes de marcar como enviado.", variant: "destructive" });
      return;
    }
    saveOrderMutation.mutate({ id: order.id, payload: { orderStatus: targetStatus, trackingCode: trackingCode || undefined } }, {
      onSuccess: () => toast({ title: "Logística atualizada", description: `Pedido #${order.orderNumber} atualizado para ${statusLabels[targetStatus]}.` }),
    });
  };
  const copySupplierText = async (order: ApiOrder) => {
    setCopyingSupplierId(order.id);
    try {
      const data = await getAdminSupplierText(order.id);
      await navigator.clipboard.writeText(data.text);
      toast({ title: "Texto copiado", description: `Texto do fornecedor do pedido #${order.orderNumber} copiado.` });
    } catch (error) {
      toast({ title: "Erro ao copiar texto do fornecedor", description: error instanceof Error ? error.message : "Tente novamente.", variant: "destructive" });
    } finally { setCopyingSupplierId(null); }
  };
  const runExport = async (format: "csv" | "xlsx") => {
    setExportingFormat(format);
    try {
      await downloadAdminExportOrders({
        format,
        dateFrom: ordersDateFrom || undefined,
        dateTo: ordersDateTo || undefined,
        orderStatus: statusFilter !== "todos" ? statusFilter : undefined,
      });
      toast({ title: "Exportação concluída", description: `Arquivo ${format.toUpperCase()} baixado.` });
    } catch (e) {
      toast({ title: "Erro ao exportar", description: e instanceof Error ? e.message : "Tente novamente.", variant: "destructive" });
    } finally {
      setExportingFormat(null);
    }
  };
  const openWhatsApp = async (order: ApiOrder) => {
    try {
      const { text } = await getAdminSupplierText(order.id);
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    } catch {
      toast({ title: "Erro ao gerar texto para WhatsApp", variant: "destructive" });
    }
  };

  const totalRevenue = filtered.reduce((s, o) => s + o.totalAmount, 0);
  const totalProfit = filtered.reduce((s, o) => s + getProfit(o), 0);
  const shippingPolicies = settingsData?.shippingPolicies ?? [];

  // Metrics chart data
  const regionChartData = useMemo(() => {
    if (!metricsData?.byRegion) return [];
    return Object.entries(metricsData.byRegion).map(([name, data]) => ({ name, pedidos: data.count, total: data.total }));
  }, [metricsData]);

  const paymentChartData = useMemo(() => {
    if (!metricsData?.byPaymentMethod) return [];
    return Object.entries(metricsData.byPaymentMethod).map(([name, data]) => ({ name, pedidos: data.count, total: data.total }));
  }, [metricsData]);

  const statusChartData = useMemo(() => {
    if (!metricsData?.byOrderStatus) return [];
    return Object.entries(metricsData.byOrderStatus).map(([name, value]) => ({ name: statusLabels[name] || name, value }));
  }, [metricsData]);

  const tabButtons = [
    { key: "pedidos" as const, icon: ShoppingBag, label: "Pedidos" },
    { key: "logistica" as const, icon: Truck, label: "Logística" },
    { key: "produtos" as const, icon: Package, label: "Produtos" },
    { key: "metricas" as const, icon: BarChart3, label: "Métricas" },
    { key: "relatorios" as const, icon: BarChart3, label: "Relatórios" },
    { key: "config" as const, icon: Settings, label: "Configurações" },
  ];

  const handleAdminKeySubmit = (event: FormEvent) => {
    event.preventDefault();
    const key = adminKeyInput.trim();
    if (!key) {
      toast({ title: "Chave obrigatória", description: "Informe a chave admin.", variant: "destructive" });
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("adminKey", key);
    }
    setAdminKey(key);
    setAdminKeyInput("");
    toast({ title: "Acesso liberado", description: "Chave admin salva no navegador." });
  };

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
              <CardDescription>Informe a chave admin para liberar o painel.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminKeySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-key">Chave admin</Label>
                  <Input
                    id="admin-key"
                    type="password"
                    required
                    value={adminKeyInput}
                    onChange={(event) => setAdminKeyInput(event.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Entrar no painel
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>A chave fica salva apenas neste navegador.</span>
              <span>Demo: <code className="rounded bg-secondary px-1">torcida-urbana-admin-secret</code> (configure ADMIN_API_KEY no .env do backend)</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
          {tabButtons.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${tab === key ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* PEDIDOS TAB */}
        {tab === "pedidos" && (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-heading text-4xl text-foreground">PAINEL ADMINISTRATIVO</h1>
                <p className="text-sm text-muted-foreground">Gerencie seus pedidos</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => runExport("csv")} disabled={exportingFormat !== null} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
                  <Download className="h-4 w-4" /> {exportingFormat === "csv" ? "..." : "CSV"}
                </button>
                <button onClick={() => runExport("xlsx")} disabled={exportingFormat !== null} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
                  <Download className="h-4 w-4" /> {exportingFormat === "xlsx" ? "..." : "Excel"}
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: "Total Pedidos", value: filtered.length.toString() },
                { label: "Faturamento (inclui frete)", value: asCurrency(totalRevenue) },
                { label: "Lucro Estimado", value: asCurrency(totalProfit), highlight: true },
                { label: "Pendentes", value: filtered.filter((o) => o.orderStatus === "aguardando").length.toString() },
              ].map((card) => (
                <div key={card.label} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className={`mt-1 font-heading text-2xl ${card.highlight ? "text-primary" : "text-foreground"}`}>{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Período:</span>
                <button type="button" onClick={() => setPeriodPreset("hoje")} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:bg-secondary">Hoje</button>
                <button type="button" onClick={() => setPeriodPreset("7dias")} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:bg-secondary">7 dias</button>
                <button type="button" onClick={() => setPeriodPreset("mes")} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:bg-secondary">Mês</button>
                <input type="date" value={ordersDateFrom} onChange={(e) => setOrdersDateFrom(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground" title="Data inicial" />
                <input type="date" value={ordersDateTo} onChange={(e) => setOrdersDateTo(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground" title="Data final" />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Buscar por número, cliente, e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground" />
                </div>
                <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                  <input type="checkbox" checked={needsShippingOnly} onChange={(e) => setNeedsShippingOnly(e.target.checked)} className="rounded" />
                  Só precisa enviar
                </label>
                <div className="relative">
                  <select value={orderSort} onChange={(e) => setOrderSort(e.target.value as typeof orderSort)} className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground">
                    <option value="recent">Mais recentes</option>
                    <option value="value_desc">Maior valor</option>
                    <option value="profit_desc">Maior lucro</option>
                    <option value="pending">Pendentes</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="relative">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground">
                    <option value="todos">Status do pedido</option>
                    {Object.entries(statusLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="relative">
                  <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground">
                    <option value="todos">Pagamento</option>
                    {Object.entries(paymentLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="relative">
                  <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground">
                    <option value="todos">Canal</option>
                    {Object.entries(CHANNEL_LABELS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="relative">
                  <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground">
                    <option value="todos">UF</option>
                    {UFS.map((uf) => (<option key={uf} value={uf}>{uf}</option>))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            {loadingOrders ? (
              <p className="mt-6 text-sm text-muted-foreground">Carregando pedidos...</p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[1280px]">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 text-left">
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Pedido</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Data/hora</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Cliente</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Produtos</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Venda</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Custo</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Frete cob.</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Frete pago</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Canal</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Pagamento</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Status pag.</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Lucro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id} onClick={() => openDetail(order)} className="cursor-pointer border-b border-border hover:bg-secondary/30">
                        <td className="px-3 py-2 text-sm font-medium text-primary">#{order.orderNumber}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{new Date(order.createdAt).toLocaleString("pt-BR")}</td>
                        <td className="px-3 py-2 text-sm text-foreground">{order.customerName}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground max-w-[220px]">
                          {order.items.map((i) => `${i.productName} (${i.variation || "-"}) x${i.quantity}`).join("; ")}
                        </td>
                        <td className="px-3 py-2 text-sm text-foreground">{asCurrency(order.totalAmount)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{order.totalCost != null ? asCurrency(order.totalCost) : "-"}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{asCurrency(order.shippingCost)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{order.shippingCostPaid != null ? asCurrency(order.shippingCostPaid) : "-"}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{order.source ? (CHANNEL_LABELS[order.source] ?? order.source) : "-"}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{order.paymentMethod}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${paymentColors[order.paymentStatus] || "bg-secondary text-foreground"}`}>
                            {paymentLabels[order.paymentStatus] || order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.orderStatus] || "bg-secondary text-foreground"}`}>
                            {statusLabels[order.orderStatus] || order.orderStatus}
                          </span>
                        </td>
                        <td className={`px-3 py-2 text-sm font-medium ${getProfit(order) >= 0 ? "text-green-400" : "text-destructive"}`}>{asCurrency(getProfit(order))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* LOGÍSTICA TAB */}
        {tab === "logistica" && (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-heading text-4xl text-foreground">CENTRAL LOGÍSTICA</h1>
                <p className="text-sm text-muted-foreground">Fluxo para funcionários: separação, envio e entrega</p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {logisticsColumns.map((column) => {
                  const amount = logisticsBase.filter((o) => o.orderStatus === column.key).length;
                  return (
                    <div key={column.key} className="rounded-lg border border-border bg-card px-3 py-2 text-center">
                      <p className="text-[11px] text-muted-foreground">{column.label}</p>
                      <p className="font-heading text-2xl text-primary">{amount}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Buscar por pedido, cliente ou UF..." value={logisticsSearch} onChange={(e) => setLogisticsSearch(e.target.value)} className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground" />
              </div>
              <div className="relative">
                <select value={logisticsStatusFilter} onChange={(e) => setLogisticsStatusFilter(e.target.value)} className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground">
                  <option value="todos">Todas etapas</option>
                  {logisticsColumns.map((c) => (<option key={c.key} value={c.key}>{c.label}</option>))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <div className="relative">
                <select value={logisticsPriorityFilter} onChange={(e) => setLogisticsPriorityFilter(e.target.value as "todos" | "atrasado" | "atencao" | "no_prazo")} className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground">
                  <option value="todos">Todas prioridades</option>
                  <option value="atrasado">Atrasado</option>
                  <option value="atencao">Atenção</option>
                  <option value="no_prazo">No prazo</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">Atrasados: {logisticsLateCount}</span>
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400">Em atenção: {logisticsAttentionCount}</span>
            </div>

            {loadingOrders ? (
              <p className="mt-6 text-sm text-muted-foreground">Carregando logística...</p>
            ) : (
              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                {logisticsColumns.map((column) => {
                  const columnOrders = logisticsFiltered.filter((o) => o.orderStatus === column.key);
                  const ColumnIcon = column.icon;
                  return (
                    <section key={column.key} className="rounded-lg border border-border bg-card">
                      <header className="flex items-center gap-2 border-b border-border px-3 py-3">
                        <ColumnIcon className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{column.label}</h3>
                        <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{columnOrders.length}</span>
                      </header>
                      <div className="max-h-[540px] space-y-3 overflow-y-auto p-3">
                        {columnOrders.length === 0 && (<p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">Nenhum pedido nesta etapa.</p>)}
                        {columnOrders.map((order) => (
                          <article key={order.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                            {(() => {
                              const priority = getLogisticsPriority(order);
                              const ageHours = getOrderAgeHours(order);
                              return (
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${logisticsPriorityConfig[priority].className}`}>{logisticsPriorityConfig[priority].label}</span>
                                  <span className="text-[11px] text-muted-foreground">há {Math.floor(ageHours)}h</span>
                                </div>
                              );
                            })()}
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-primary">#{order.orderNumber}</p>
                              <button onClick={() => copySupplierText(order)} disabled={copyingSupplierId === order.id} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50">
                                <Copy className="h-3 w-3" /> Fornecedor
                              </button>
                            </div>
                            <p className="mt-1 text-sm text-foreground">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.addressCity}/{order.addressState} - {asCurrency(order.totalAmount)}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{order.items.map((i) => `${i.productName} ${i.variation ? `(${i.variation})` : ""}`).join(", ")}</p>
                            {(column.key === "em_separacao" || column.key === "enviado") && (
                              <input type="text" placeholder="Código de rastreio" value={trackingDrafts[order.id] ?? order.trackingCode ?? ""} onChange={(e) => setTrackingDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))} className="mt-2 w-full rounded-md border border-border bg-card px-2 py-1.5 text-xs" />
                            )}
                            <div className="mt-2 flex gap-2">
                              {column.key === "aguardando" && (<button onClick={() => updateOrderStatusQuick(order, "em_separacao")} className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">Iniciar separação</button>)}
                              {column.key === "em_separacao" && (<button onClick={() => updateOrderStatusQuick(order, "enviado")} className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">Marcar enviado</button>)}
                              {column.key === "enviado" && (<button onClick={() => updateOrderStatusQuick(order, "entregue")} className="rounded-md bg-green-600 px-2 py-1 text-xs text-white">Confirmar entrega</button>)}
                              <button onClick={() => openDetail(order)} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Detalhes</button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* MÉTRICAS TAB */}
        {tab === "metricas" && (
          <>
            <div className="mb-6">
              <h1 className="font-heading text-4xl text-foreground">MÉTRICAS</h1>
              <p className="text-sm text-muted-foreground">Indicadores de desempenho da loja</p>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input type="date" value={metricsDateFrom} onChange={(e) => setMetricsDateFrom(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
              <input type="date" value={metricsDateTo} onChange={(e) => setMetricsDateTo(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </div>

            {loadingMetrics ? (
              <p className="text-sm text-muted-foreground">Carregando métricas...</p>
            ) : metricsData && (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  {[
                    { label: "Total Pedidos", value: metricsData.totalOrders.toString() },
                    { label: "Faturamento", value: asCurrency(metricsData.totalRevenue), highlight: true },
                    { label: "Custos", value: asCurrency(metricsData.totalCost) },
                    { label: "Lucro", value: asCurrency(metricsData.totalProfit), highlight: true },
                    { label: "Ticket Médio", value: asCurrency(metricsData.ticketMedio) },
                  ].map((card) => (
                    <div key={card.label} className="rounded-lg border border-border bg-card p-4">
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                      <p className={`mt-1 font-heading text-2xl ${card.highlight ? "text-primary" : "text-foreground"}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {/* Pedidos por Região */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="mb-4 font-heading text-xl text-foreground">PEDIDOS POR REGIÃO</h3>
                    {regionChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={regionChartData}>
                          <XAxis dataKey="name" tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} />
                          <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: 8, color: "hsl(0,0%,96%)" }} />
                          <Bar dataKey="pedidos" fill="hsl(45,100%,50%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="py-10 text-center text-sm text-muted-foreground">Sem dados disponíveis</p>
                    )}
                  </div>

                  {/* Pedidos por Forma de Pagamento */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="mb-4 font-heading text-xl text-foreground">FORMA DE PAGAMENTO</h3>
                    {paymentChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={paymentChartData} cx="50%" cy="50%" outerRadius={100} dataKey="pedidos" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {paymentChartData.map((_, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: 8, color: "hsl(0,0%,96%)" }} />
                          <Legend wrapperStyle={{ color: "hsl(0,0%,55%)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="py-10 text-center text-sm text-muted-foreground">Sem dados disponíveis</p>
                    )}
                  </div>

                  {/* Status dos Pedidos */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="mb-4 font-heading text-xl text-foreground">STATUS DOS PEDIDOS</h3>
                    {statusChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={statusChartData} layout="vertical">
                          <XAxis type="number" tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} />
                          <YAxis dataKey="name" type="category" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} width={120} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: 8, color: "hsl(0,0%,96%)" }} />
                          <Bar dataKey="value" fill="hsl(38,100%,55%)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="py-10 text-center text-sm text-muted-foreground">Sem dados disponíveis</p>
                    )}
                  </div>

                  {/* Faturamento por Pagamento */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="mb-4 font-heading text-xl text-foreground">FATURAMENTO POR PAGAMENTO</h3>
                    {paymentChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={paymentChartData}>
                          <XAxis dataKey="name" tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} />
                          <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,16%)", borderRadius: 8, color: "hsl(0,0%,96%)" }} formatter={(value: number) => asCurrency(value)} />
                          <Bar dataKey="total" fill="hsl(200,80%,55%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="py-10 text-center text-sm text-muted-foreground">Sem dados disponíveis</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* RELATÓRIOS TAB */}
        {tab === "relatorios" && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as "day" | "month")} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <option value="day">Agrupar por dia</option>
                <option value="month">Agrupar por mês</option>
              </select>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </div>
            {loadingReport ? (
              <p className="text-sm text-muted-foreground">Carregando relatório...</p>
            ) : reportData && (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Pedidos</p><p className="mt-1 text-xl font-semibold">{reportData.summary.totalOrders}</p></div>
                  <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Receita Total</p><p className="mt-1 text-xl font-semibold text-primary">{asCurrency(reportData.summary.totalRevenue)}</p></div>
                  <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Receita Produtos</p><p className="mt-1 text-xl font-semibold">{asCurrency(reportData.summary.productsRevenue)}</p></div>
                  <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Receita Frete</p><p className="mt-1 text-xl font-semibold">{asCurrency(reportData.summary.freightRevenue)}</p></div>
                  <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Ticket Médio</p><p className="mt-1 text-xl font-semibold">{asCurrency(reportData.summary.averageTicket)}</p></div>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-3 font-heading text-xl">Série de Vendas</h3>
                    <div className="max-h-72 overflow-auto text-sm">
                      {reportData.series.map((row) => (
                        <div key={row.period} className="flex items-center justify-between border-b border-border py-2">
                          <span className="text-muted-foreground">{row.period}</span>
                          <span>{row.orders} pedidos</span>
                          <strong className="text-primary">{asCurrency(row.revenue)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-3 font-heading text-xl">Top Produtos</h3>
                    <div className="max-h-72 overflow-auto text-sm">
                      {reportData.topProducts.map((row) => (
                        <div key={row.productName} className="flex items-center justify-between border-b border-border py-2">
                          <span className="max-w-[60%] truncate text-muted-foreground">{row.productName}</span>
                          <span>{row.quantity} un.</span>
                          <strong>{asCurrency(row.revenue)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* PRODUTOS TAB — catálogo com fornecedor e custo (só admin) */}
        {tab === "produtos" && (
          <>
            <div className="mb-6">
              <h1 className="font-heading text-4xl text-foreground">Catálogo de Produtos</h1>
              <p className="text-sm text-muted-foreground">Produtos com fornecedor e custo — informação interna (cliente não vê)</p>
            </div>
            {loadingAdminProducts ? (
              <p className="text-sm text-muted-foreground">Carregando produtos...</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 font-medium text-foreground">Produto</th>
                      <th className="px-4 py-3 font-medium text-foreground">Categoria</th>
                      <th className="px-4 py-3 font-medium text-foreground">Fornecedor</th>
                      <th className="px-4 py-3 font-medium text-foreground">Custo (R$)</th>
                      <th className="px-4 py-3 font-medium text-foreground">Preço venda (R$)</th>
                      <th className="px-4 py-3 font-medium text-foreground">Ativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProducts.map((p: ApiAdminProduct) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">{p.name}</span>
                          <span className="ml-1 text-xs text-muted-foreground">({p.slug})</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category.name}</td>
                        <td className="px-4 py-3">{p.supplier?.name ?? "—"}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {p.costMin === p.costMax ? asCurrency(p.costMin) : `${asCurrency(p.costMin)} – ${asCurrency(p.costMax)}`}
                        </td>
                        <td className="px-4 py-3 font-mono text-foreground">
                          {p.priceMin === p.priceMax ? asCurrency(p.priceMin) : `${asCurrency(p.priceMin)} – ${asCurrency(p.priceMax)}`}
                        </td>
                        <td className="px-4 py-3">{p.active ? "Sim" : "Não"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adminProducts.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
                )}
              </div>
            )}
          </>
        )}

        {/* CONFIG TAB */}
        {tab === "config" && (
          <>
            {loadingSettings ? (
              <p className="text-sm text-muted-foreground">Carregando configurações...</p>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-heading text-xl">Configuração de Frete Grátis</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Defina o valor mínimo do pedido para frete grátis.</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input type="number" min={0} value={freeShippingThreshold || settingsData?.config.free_shipping_threshold || "500"} onChange={(e) => setFreeShippingThreshold(e.target.value)} className="w-48 rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
                    <button onClick={() => saveThresholdMutation.mutate(freeShippingThreshold || settingsData?.config.free_shipping_threshold || "500")} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Salvar</button>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-heading text-xl">Tabela de Frete por Região</h3>
                  <div className="mt-4 space-y-3">
                    {shippingPolicies.map((policy) => (
                      <div key={policy.id} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-4">
                        <div><p className="text-sm font-semibold">{policy.region}</p><p className="text-xs text-muted-foreground">{policy.description || "-"}</p></div>
                        <input type="number" min={0} defaultValue={policy.price} id={`price-${policy.id}`} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
                        <input type="text" defaultValue={policy.description || ""} id={`desc-${policy.id}`} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
                        <button onClick={() => {
                          const priceInput = document.getElementById(`price-${policy.id}`) as HTMLInputElement | null;
                          const descInput = document.getElementById(`desc-${policy.id}`) as HTMLInputElement | null;
                          saveShippingMutation.mutate({ region: policy.region, price: Number(priceInput?.value ?? policy.price), description: descInput?.value ?? policy.description ?? "" });
                        }} className="rounded-lg border border-primary px-3 py-2 text-sm text-primary">Atualizar</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ORDER DETAIL MODAL */}
        <AnimatePresence>
          {selectedOrder && (() => {
            const detail = orderDetail ?? selectedOrder;
            const isLoadingDetail = selectedOrder.id && !orderDetail && loadingDetail;
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl text-foreground">PEDIDO #{detail.orderNumber}</h2>
                    <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                  </div>
                  {isLoadingDetail ? (
                    <p className="mt-6 text-sm text-muted-foreground">Carregando detalhes...</p>
                  ) : (
                    <>
                      <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground">CLIENTE</h4>
                          <p className="mt-1 text-sm text-foreground">{detail.customerName}</p>
                          <p className="text-xs text-muted-foreground">{detail.customerEmail}</p>
                          <p className="text-xs text-muted-foreground">{detail.customerPhone || "-"}</p>
                          {(detail as ApiOrderDetail).customerCpf && <p className="text-xs text-muted-foreground">CPF: {(detail as ApiOrderDetail).customerCpf}</p>}
                          <p className="mt-2 text-xs text-muted-foreground">{buildCustomerAddress(detail)}</p>
                          <button type="button" onClick={() => { navigator.clipboard.writeText(buildCustomerAddress(detail)); toast({ title: "Endereço copiado" }); }} className="mt-2 inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"><Copy className="h-3 w-3" /> Copiar endereço</button>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground">DATA</h4>
                          <p className="mt-1 text-sm text-foreground">{new Date(detail.createdAt).toLocaleString("pt-BR")}</p>
                          <h4 className="mt-3 text-xs font-medium text-muted-foreground">PAGAMENTO</h4>
                          <p className="mt-1 text-sm text-foreground">
                            {detail.paymentMethod}{" "}
                            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${paymentColors[detail.paymentStatus] || "bg-secondary text-foreground"}`}>
                              {paymentLabels[detail.paymentStatus] || detail.paymentStatus}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-xs font-medium text-muted-foreground">PRODUTOS</h4>
                        <div className="mt-1 overflow-x-auto rounded border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border bg-secondary/50 text-left">
                                <th className="px-2 py-1.5 text-xs text-muted-foreground">Produto</th>
                                <th className="px-2 py-1.5 text-xs text-muted-foreground">Variação</th>
                                <th className="px-2 py-1.5 text-xs text-muted-foreground">Personalização</th>
                                <th className="px-2 py-1.5 text-xs text-muted-foreground">Qtd</th>
                                <th className="px-2 py-1.5 text-xs text-muted-foreground">Preço un.</th>
                                <th className="px-2 py-1.5 text-xs text-muted-foreground">Custo un.</th>
                                <th className="px-2 py-1.5 text-xs text-muted-foreground">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detail.items.map((i) => (
                                <tr key={i.id} className="border-b border-border last:border-0">
                                  <td className="px-2 py-1.5 text-foreground">{i.productName}{(i as { itemNotes?: string | null }).itemNotes ? ` (${(i as { itemNotes?: string | null }).itemNotes})` : ""}</td>
                                  <td className="px-2 py-1.5 text-muted-foreground">{i.variation || "-"}</td>
                                  <td className="px-2 py-1.5 text-muted-foreground">{(i as { personalization?: string | null }).personalization || "-"}</td>
                                  <td className="px-2 py-1.5">{i.quantity}</td>
                                  <td className="px-2 py-1.5">{asCurrency(i.unitPrice)}</td>
                                  <td className="px-2 py-1.5 text-muted-foreground">{i.unitCost != null ? asCurrency(i.unitCost) : "-"}</td>
                                  <td className="px-2 py-1.5">{asCurrency((i.unitPrice * i.quantity))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Subtotal: {asCurrency(detail.subtotal ?? detail.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0))} · Frete cobrado: {asCurrency(detail.shippingCost)} · Frete pago: {detail.shippingCostPaid != null ? asCurrency(detail.shippingCostPaid) : "-"} · Total: {asCurrency(detail.totalAmount)}
                        </p>
                        {detail.totalCost != null && <p className="text-xs text-muted-foreground">Custo total: {asCurrency(detail.totalCost)} · Lucro est.: {asCurrency((detail.estimatedProfit ?? detail.totalAmount - detail.totalCost))}</p>}
                      </div>
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">Status do Pedido</label>
                          <select value={editingStatus} onChange={(e) => setEditingStatus(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm">
                            {Object.entries(statusLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">Código de Rastreamento</label>
                          <input type="text" value={editingTracking} onChange={(e) => setEditingTracking(e.target.value)} maxLength={50} className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm" />
                          {(detail as ApiOrderDetail).trackingUrl && (detail as ApiOrderDetail).trackingCode && (
                            <a href={(detail as ApiOrderDetail).trackingUrl!} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-primary hover:underline">Rastrear envio</a>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Notas internas</label>
                        <textarea value={editingNotes} onChange={(e) => setEditingNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm" placeholder="Anotações do pedido..." />
                      </div>
                      {"communications" in detail && detail.communications && detail.communications.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-medium text-muted-foreground">HISTÓRICO DE COMUNICAÇÃO</h4>
                          <ul className="mt-1 max-h-32 space-y-1 overflow-y-auto rounded border border-border bg-secondary/30 p-2 text-xs">
                            {detail.communications!.map((c) => (
                              <li key={c.id} className="flex justify-between gap-2">
                                <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleString("pt-BR")}</span>
                                <span className="flex-1 truncate">{c.content}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {"returns" in detail && detail.returns && detail.returns.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-medium text-muted-foreground">TROCAS/DEVOLUÇÕES</h4>
                          <ul className="mt-1 space-y-1 rounded border border-border bg-secondary/30 p-2 text-xs">
                            {detail.returns!.map((r) => (
                              <li key={r.id}>Motivo: {r.reason} · Status: {r.status} {r.description && `· ${r.description}`}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => copySupplierText(detail)} disabled={copyingSupplierId === detail.id} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary">
                          <Copy className="h-4 w-4" /> Copiar para fornecedor
                        </button>
                        <button onClick={() => openWhatsApp(detail)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary">
                          <Send className="h-4 w-4" /> WhatsApp
                        </button>
                      </div>
                      <div className="mt-4">
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Nova comunicação</label>
                        <div className="flex gap-2">
                          <input type="text" value={newCommunication} onChange={(e) => setNewCommunication(e.target.value)} placeholder="Registrar contato ou observação..." className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
                          <Button type="button" size="sm" onClick={addCommunication} disabled={!newCommunication.trim() || addCommMutation.isPending}>Adicionar</Button>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button onClick={saveOrderChanges} disabled={saveOrderMutation.isPending} className="gradient-primary flex-1 rounded-lg px-6 py-2 font-heading text-primary-foreground disabled:opacity-70">SALVAR ALTERAÇÕES</button>
                        <button onClick={() => setSelectedOrder(null)} className="rounded-lg border border-border px-6 py-2 text-sm">Fechar</button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
