import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, X, ChevronDown, Settings, BarChart3, ShoppingBag,
  Truck, PackageCheck, Send, CheckCircle2, Copy,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import Layout from "@/components/Layout";
import {
  getAdminOrders, updateAdminOrder, type ApiOrder,
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

const Admin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<"pedidos" | "logistica" | "metricas" | "relatorios" | "config">("pedidos");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [logisticsSearch, setLogisticsSearch] = useState("");
  const [logisticsStatusFilter, setLogisticsStatusFilter] = useState<string>("todos");
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

  const { data: ordersData, isLoading: loadingOrders } = useQuery({ queryKey: ["admin-orders"], queryFn: getAdminOrders });
  const { data: reportData, isLoading: loadingReport } = useQuery({
    queryKey: ["admin-report", groupBy, dateFrom, dateTo],
    queryFn: () => getSalesReport({ groupBy, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
  });
  const { data: settingsData, isLoading: loadingSettings } = useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettings });
  const { data: metricsData, isLoading: loadingMetrics } = useQuery({
    queryKey: ["admin-metrics", metricsDateFrom, metricsDateTo],
    queryFn: () => getMetrics(metricsDateFrom || undefined, metricsDateTo || undefined),
  });

  const saveOrderMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { orderStatus?: string; trackingCode?: string } }) => updateAdminOrder(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-orders"] }); setSelectedOrder(null); },
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
  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== "todos") result = result.filter((o) => o.orderStatus === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.id.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
    }
    return result;
  }, [orders, search, statusFilter]);

  const logisticsBase = useMemo(() => orders.filter((order) => logisticsColumns.some((c) => c.key === order.orderStatus)), [orders]);
  const logisticsFiltered = useMemo(() => {
    let result = logisticsBase;
    if (logisticsStatusFilter !== "todos") result = result.filter((o) => o.orderStatus === logisticsStatusFilter);
    if (logisticsSearch) {
      const q = logisticsSearch.toLowerCase();
      result = result.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.addressState.toLowerCase().includes(q));
    }
    return result;
  }, [logisticsBase, logisticsSearch, logisticsStatusFilter]);

  const openDetail = (order: ApiOrder) => { setSelectedOrder(order); setEditingStatus(order.orderStatus); setEditingTracking(order.trackingCode || ""); };
  const saveOrderChanges = () => {
    if (!selectedOrder) return;
    saveOrderMutation.mutate({ id: selectedOrder.id, payload: { orderStatus: editingStatus, trackingCode: editingTracking || undefined } });
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
  const exportCSV = () => {
    const headers = ["Pedido", "Data", "Cliente", "Produtos", "Total c/ frete", "Pagamento", "Status"];
    const rows = filtered.map((o) => [
      o.orderNumber, new Date(o.createdAt).toLocaleDateString("pt-BR"), o.customerName,
      o.items.map((i) => `${i.productName} (${i.variation || "-"}) x${i.quantity}`).join("; "),
      o.totalAmount.toFixed(2), o.paymentMethod, statusLabels[o.orderStatus] || o.orderStatus,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `pedidos-pe-na-bola-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
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
    { key: "metricas" as const, icon: BarChart3, label: "Métricas" },
    { key: "relatorios" as const, icon: BarChart3, label: "Relatórios" },
    { key: "config" as const, icon: Settings, label: "Configurações" },
  ];

  return (
    <Layout>
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
              <button onClick={exportCSV} disabled={filtered.length === 0} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
                <Download className="h-4 w-4" /> Exportar CSV
              </button>
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

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Buscar por ID, número ou cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground" />
              </div>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground">
                  <option value="todos">Todos os Status</option>
                  {Object.entries(statusLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {loadingOrders ? (
              <p className="mt-6 text-sm text-muted-foreground">Carregando pedidos...</p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 text-left">
                      {["Pedido", "Data", "Cliente", "Produtos", "Total (c/ frete)", "Pagamento", "Status", "Lucro"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id} onClick={() => openDetail(order)} className="cursor-pointer border-b border-border hover:bg-secondary/30">
                        <td className="px-4 py-3 text-sm font-medium text-primary">#{order.orderNumber}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{order.customerName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{order.items.map((i) => `${i.productName} (${i.variation || "-"})`).join(", ")}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{asCurrency(order.totalAmount)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{order.paymentMethod}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.orderStatus] || "bg-secondary text-foreground"}`}>
                            {statusLabels[order.orderStatus] || order.orderStatus}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium ${getProfit(order) >= 0 ? "text-green-400" : "text-destructive"}`}>{asCurrency(getProfit(order))}</td>
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
          {selectedOrder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl text-foreground">PEDIDO #{selectedOrder.orderNumber}</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">CLIENTE</h4>
                    <p className="mt-1 text-sm text-foreground">{selectedOrder.customerName}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.customerEmail}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.customerPhone}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{buildCustomerAddress(selectedOrder)}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">DATA</h4>
                    <p className="mt-1 text-sm text-foreground">{new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}</p>
                    <h4 className="mt-3 text-xs font-medium text-muted-foreground">PAGAMENTO</h4>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedOrder.paymentMethod} -
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${paymentColors[selectedOrder.paymentStatus] || "bg-secondary text-foreground"}`}>{selectedOrder.paymentStatus}</span>
                    </p>
                  </div>
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
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={saveOrderChanges} className="gradient-primary flex-1 rounded-lg px-6 py-2 font-heading text-primary-foreground">SALVAR ALTERAÇÕES</button>
                  <button onClick={() => setSelectedOrder(null)} className="rounded-lg border border-border px-6 py-2 text-sm">Fechar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Admin;
