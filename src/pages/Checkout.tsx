
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, ArrowLeft, CreditCard, Lock } from "lucide-react";
import Layout from "../components/Layout";
import { getShippingQuote, createMercadoPagoTransparentPayment } from "../lib/api";
import { useCart } from "../contexts/CartContext";
import { formatCurrency, cn } from "../lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const Checkout = () => {
  const { items, subtotal, total, appliedCoupon, applyCoupon, discountAmount, clearCart } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressStreet: "",
    addressNumber: "",
    addressCity: "",
    addressState: "",
    addressZip: "",
  });
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const { data: shippingData, isLoading: loadingShipping } = useQuery({
    queryKey: ["shipping-quote", form.addressState, subtotal],
    queryFn: () => getShippingQuote(form.addressState, subtotal),
    enabled: form.addressState.length === 2,
  });

  const freightCost = shippingData?.finalShippingCost ?? 0;
  const finalTotal = total + freightCost;

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (form.addressState.length !== 2) {
      toast.error("UF inválida", { description: "Informe o estado para calcularmos seu frete regional." });
      return;
    }

    try {
      const res = await createMercadoPagoTransparentPayment({ ...form, items, total: finalTotal });
      setOrderNumber(res.orderNumber);
      clearCart();
      toast.success("Manto Garantido!", { description: `Seu pedido #${res.orderNumber} está sendo processado.` });
    } catch (err) {
      toast.error("Erro no processamento.");
    }
  };

  if (items.length === 0 && !orderNumber) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground text-lg mb-6">Seu carrinho está vazio.</p>
          <Link to="/produtos" className="gradient-primary rounded-xl px-8 py-3 font-heading text-white shadow-lg">
            VOLTAR À LOJA
          </Link>
        </div>
      </Layout>
    );
  }

  if (orderNumber) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-xl">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-8">
            <ShieldCheck className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h1 className="font-fat text-4xl text-white mb-4 italic tracking-tighter">PEDIDO CONFIRMADO!</h1>
          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
            O pedido <span className="text-white font-bold">#{orderNumber}</span> foi criado com sucesso. 
            O total de <span className="text-primary font-bold">{formatCurrency(finalTotal)}</span> está aguardando pagamento.
          </p>
          <Link to="/" className="gradient-primary rounded-xl px-12 py-4 font-fat text-xl text-white tracking-tight">
            INÍCIO
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto grid gap-12 px-4 py-12 md:grid-cols-3">
        <section className="md:col-span-2">
          <Link to="/produtos" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-8 text-xs font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Escolher mais produtos
          </Link>
          <h1 className="font-fat text-4xl text-white uppercase italic tracking-tighter mb-10 border-b border-primary/20 pb-4">
            Finalizar <span className="text-primary">Compra</span>
          </h1>
          
          <form onSubmit={handleFinish} className="space-y-12">
            <div className="space-y-6">
              <h3 className="flex items-center gap-3 text-sm font-black text-primary uppercase tracking-widest">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-black font-fat">01</span>
                Dados Pessoais
              </h3>
              <div className="grid gap-4">
                <input required placeholder="Nome Completo" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full rounded-xl border border-border bg-secondary/50 px-6 py-4 text-white focus:border-primary-glow outline-none transition-all" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required type="email" placeholder="Seu melhor e-mail" value={form.customerEmail} onChange={e => setForm({...form, customerEmail: e.target.value})} className="rounded-xl border border-border bg-secondary/50 px-6 py-4 text-white focus:border-primary-glow outline-none transition-all" />
                  <input required placeholder="WhatsApp" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} className="rounded-xl border border-border bg-secondary/50 px-6 py-4 text-white focus:border-primary-glow outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-3 text-sm font-black text-primary uppercase tracking-widest">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-black font-fat">02</span>
                Endereço de Entrega
              </h3>
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <input required placeholder="CEP" value={form.addressZip} onChange={e => setForm({...form, addressZip: e.target.value})} className="rounded-xl border border-border bg-secondary/50 px-6 py-4 text-white focus:border-primary-glow outline-none transition-all" />
                  <input required placeholder="UF" maxLength={2} value={form.addressState} onChange={e => setForm({...form, addressState: e.target.value.toUpperCase()})} className="rounded-xl border border-border bg-secondary/50 px-6 py-4 text-white font-fat text-center focus:border-primary-glow outline-none transition-all placeholder:font-sans placeholder:font-normal" />
                  <input required placeholder="Cidade" value={form.addressCity} onChange={e => setForm({...form, addressCity: e.target.value})} className="rounded-xl border border-border bg-secondary/50 px-6 py-4 text-white focus:border-primary-glow outline-none transition-all" />
                </div>
                <div className="grid sm:grid-cols-4 gap-4">
                  <input required placeholder="Rua / Avenida" value={form.addressStreet} onChange={e => setForm({...form, addressStreet: e.target.value})} className="sm:col-span-3 rounded-xl border border-border bg-secondary/50 px-6 py-4 text-white focus:border-primary-glow outline-none transition-all" />
                  <input required placeholder="Nº" value={form.addressNumber} onChange={e => setForm({...form, addressNumber: e.target.value})} className="rounded-xl border border-border bg-secondary/50 px-6 py-4 text-white focus:border-primary-glow outline-none transition-all" />
                </div>
              </div>
            </div>

            <button type="submit" className="group relative w-full overflow-hidden rounded-xl gradient-primary py-6 font-fat text-2xl text-white shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-95">
              <span className="relative z-10 flex items-center justify-center gap-3 italic">
                FINALIZAR PEDIDO: {formatCurrency(finalTotal)}
              </span>
            </button>
          </form>
        </section>

        <aside className="h-fit space-y-6">
          <div className="rounded-3xl border border-border bg-secondary/30 p-8 backdrop-blur-xl">
            <h2 className="font-fat text-2xl text-white mb-8 italic tracking-tighter">Carrinho</h2>
            
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4 border-b border-white/5 pb-6">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-black border border-white/10">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-sm text-white line-clamp-1">{item.name}</p>
                    <p className="text-[10px] uppercase text-muted-foreground font-bold mt-1">Tam: {item.size} • Qtd: {item.quantity}</p>
                    <p className="text-primary font-fat mt-1">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 space-y-4 border-t border-white/5">
              <div className="flex justify-between text-muted-foreground font-medium text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-primary font-bold text-sm">
                  <span>Desconto ({appliedCoupon.label})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground items-center text-sm">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" /> 
                  Frete Regional {shippingData ? `(${shippingData.region})` : ""}
                </span>
                <span className={cn("font-bold", freightCost === 0 && "text-green-500")}>
                  {loadingShipping ? "Calculando..." : freightCost === 0 ? "GRÁTIS" : formatCurrency(freightCost)}
                </span>
              </div>
              
              <div className="flex justify-between border-t border-primary/20 pt-6 font-fat text-3xl text-white italic tracking-tighter">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(finalTotal)}</span>
              </div>
              
              {shippingData && (
                <div className="bg-primary/10 rounded-2xl p-4 text-[11px] text-muted-foreground border border-primary/20 mt-6 leading-relaxed">
                  <p className="text-white font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-3 h-3 text-primary" /> Logística Premium
                  </p>
                  Envio para {shippingData.state} via frete {shippingData.region}. Entrega estimada em {shippingData.estimateDays.min}-{shippingData.estimateDays.max} dias.
                </div>
              )}
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/5 bg-secondary/40 p-6 flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Pagamento Criptografado</p>
              <p className="text-[10px] text-muted-foreground">Checkout seguro com processamento via SSL.</p>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default Checkout;
