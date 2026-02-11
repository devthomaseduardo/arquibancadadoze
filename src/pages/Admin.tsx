import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, X, Package, ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";
import { mockOrders, type Order, type OrderStatus, type PaymentStatus } from "@/data/orders";

const statusLabels: Record<OrderStatus, string> = {
  aguardando: "Aguardando",
  em_separacao: "Em Separação",
  enviado: "Enviado",
  entregue: "Entregue",
  trocado_devolvido: "Trocado/Devolvido",
};

const statusColors: Record<OrderStatus, string> = {
  aguardando: "bg-accent/20 text-accent",
  em_separacao: "bg-primary/20 text-primary",
  enviado: "bg-blue-500/20 text-blue-400",
  entregue: "bg-green-500/20 text-green-400",
  trocado_devolvido: "bg-destructive/20 text-destructive",
};

const paymentColors: Record<PaymentStatus, string> = {
  pendente: "bg-accent/20 text-accent",
  aprovado: "bg-green-500/20 text-green-400",
  estornado: "bg-destructive/20 text-destructive",
};

const getOrderTotal = (order: Order) =>
  order.items.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);
const getOrderCost = (order: Order) =>
  order.items.reduce((sum, i) => sum + i.cost * i.quantity, 0);
const getProfit = (order: Order) =>
  getOrderTotal(order) + order.shippingCharged - getOrderCost(order) - order.shippingCost;

const Admin = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingStatus, setEditingStatus] = useState<OrderStatus | "">("");
  const [editingTracking, setEditingTracking] = useState("");

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== "todos") {
      result = result.filter((o) => o.orderStatus === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, search, statusFilter]);

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setEditingStatus(order.orderStatus);
    setEditingTracking(order.trackingCode || "");
  };

  const saveOrderChanges = () => {
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, orderStatus: editingStatus as OrderStatus, trackingCode: editingTracking || undefined }
          : o
      )
    );
    setSelectedOrder(null);
  };

  const exportCSV = () => {
    const headers = ["Pedido", "Data", "Cliente", "Produtos", "Total Venda", "Custo", "Frete Cobrado", "Frete Pago", "Pagamento", "Status Pgto", "Status Pedido", "Lucro"];
    const rows = filtered.map((o) => [
      o.id,
      new Date(o.date).toLocaleDateString("pt-BR"),
      o.customerName,
      o.items.map((i) => `${i.productName} (${i.size}) x${i.quantity}`).join("; "),
      getOrderTotal(o).toFixed(2),
      getOrderCost(o).toFixed(2),
      o.shippingCharged.toFixed(2),
      o.shippingCost.toFixed(2),
      o.paymentMethod,
      o.paymentStatus,
      statusLabels[o.orderStatus],
      getProfit(o).toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-torcida-urbana-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = filtered.reduce((s, o) => s + getOrderTotal(o), 0);
  const totalProfit = filtered.reduce((s, o) => s + getProfit(o), 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-4xl text-foreground">PAINEL ADMINISTRATIVO</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus pedidos</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total Pedidos", value: filtered.length.toString() },
            { label: "Faturamento", value: `R$ ${totalRevenue.toFixed(2).replace(".", ",")}` },
            { label: "Lucro Estimado", value: `R$ ${totalProfit.toFixed(2).replace(".", ",")}`, highlight: true },
            { label: "Pendentes", value: filtered.filter((o) => o.orderStatus === "aguardando").length.toString() },
          ].map((card) => (
            <div key={card.label} className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className={`mt-1 font-heading text-2xl ${card.highlight ? "text-primary" : "text-foreground"}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por ID ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left">
                {["Pedido", "Data", "Cliente", "Produtos", "Total", "Custo", "Frete", "Pagamento", "Status Pgto", "Status", "Lucro"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => openDetail(order)}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-secondary/30"
                >
                  <td className="px-4 py-3 text-sm font-medium text-primary">{order.id}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(order.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{order.customerName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {order.items.map((i) => `${i.productName} (${i.size})`).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    R$ {getOrderTotal(order).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    R$ {getOrderCost(order).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {order.shippingCharged.toFixed(0)}/{order.shippingCost.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${paymentColors[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.orderStatus]}`}>
                      {statusLabels[order.orderStatus]}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${getProfit(order) >= 0 ? "text-green-400" : "text-destructive"}`}>
                    R$ {getProfit(order).toFixed(2).replace(".", ",")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Package className="mx-auto h-10 w-10 opacity-50" />
            <p className="mt-2">Nenhum pedido encontrado.</p>
          </div>
        )}

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl text-foreground">PEDIDO {selectedOrder.id}</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">CLIENTE</h4>
                    <p className="mt-1 text-sm text-foreground">{selectedOrder.customerName}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.customerEmail}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.customerPhone}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{selectedOrder.customerAddress}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">DATA</h4>
                    <p className="mt-1 text-sm text-foreground">
                      {new Date(selectedOrder.date).toLocaleString("pt-BR")}
                    </p>
                    <h4 className="mt-3 text-xs font-medium text-muted-foreground">PAGAMENTO</h4>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedOrder.paymentMethod} —{" "}
                      <span className={`rounded-full px-2 py-0.5 text-xs ${paymentColors[selectedOrder.paymentStatus]}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-6">
                  <h4 className="text-xs font-medium text-muted-foreground">PRODUTOS</h4>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between rounded-lg bg-secondary/50 px-4 py-2 text-sm">
                        <div>
                          <span className="text-foreground">{item.productName}</span>
                          <span className="ml-2 text-muted-foreground">Tam: {item.size} | Qtd: {item.quantity}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-foreground">R$ {(item.salePrice * item.quantity).toFixed(2)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">(custo: R$ {(item.cost * item.quantity).toFixed(2)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financials */}
                <div className="mt-4 rounded-lg bg-secondary/30 p-4 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total venda:</span><span className="text-foreground">R$ {getOrderTotal(selectedOrder).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Custo produtos:</span><span className="text-foreground">R$ {getOrderCost(selectedOrder).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Frete cobrado:</span><span className="text-foreground">R$ {selectedOrder.shippingCharged.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Frete pago:</span><span className="text-foreground">R$ {selectedOrder.shippingCost.toFixed(2)}</span></div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                    <span className="text-foreground">Lucro estimado:</span>
                    <span className="text-primary">R$ {getProfit(selectedOrder).toFixed(2)}</span>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Status do Pedido</label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value as OrderStatus)}
                      className="w-full appearance-none rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Código de Rastreamento</label>
                    <input
                      type="text"
                      value={editingTracking}
                      onChange={(e) => setEditingTracking(e.target.value)}
                      maxLength={50}
                      placeholder="Ex: BR123456789"
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-muted-foreground">NOTAS INTERNAS</h4>
                    <p className="mt-1 text-sm text-foreground/80">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={saveOrderChanges}
                    className="gradient-primary flex-1 rounded-lg px-6 py-2 font-heading text-primary-foreground transition-all hover:opacity-90"
                  >
                    SALVAR ALTERAÇÕES
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-lg border border-border px-6 py-2 text-sm text-foreground transition-colors hover:border-primary"
                  >
                    Fechar
                  </button>
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
