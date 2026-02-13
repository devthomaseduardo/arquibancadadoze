import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BadgeCheck, CreditCard, ExternalLink, MapPin, PackageCheck, ShieldCheck, Tag, Truck } from "lucide-react";
import Layout from "@/components/Layout";
import { createMercadoPagoDemoPurchase, createOrder, getShippingQuote } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

type CheckoutForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  paymentMethod: string;
};

const defaultForm: CheckoutForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  addressStreet: "",
  addressNumber: "",
  addressComplement: "",
  addressNeighborhood: "",
  addressCity: "",
  addressState: "",
  addressZip: "",
  paymentMethod: "pix",
};

const Checkout = () => {
  const { toast } = useToast();
  const { items, subtotal, appliedCoupon, applyCoupon, removeCoupon, discountAmount, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>(defaultForm);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [demoCheckoutUrl, setDemoCheckoutUrl] = useState<string | null>(null);

  const cartSubtotal = subtotal;
  const stateForQuote = form.addressState.trim().toUpperCase();
  const { data: quote } = useQuery({
    queryKey: ["shipping-quote", stateForQuote, cartSubtotal],
    queryFn: () => getShippingQuote(stateForQuote, cartSubtotal),
    enabled: stateForQuote.length === 2 && cartSubtotal > 0,
  });
  const shippingCost = quote?.finalShippingCost ?? 35;
  const total = cartSubtotal - discountAmount + shippingCost;

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      setCreatedOrderNumber(order.orderNumber);
      clearCart();
      setDemoCheckoutUrl(null);
      toast({ title: "Pedido criado com sucesso", description: `Pedido #${order.orderNumber} recebido.` });
    },
    onError: (err) => {
      toast({
        title: "Erro ao finalizar compra",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      toast({ title: "Cupom aplicado!", description: "Desconto ativado." });
      setCouponInput("");
      return;
    }
    toast({ title: "Cupom inválido", description: "Verifique o código.", variant: "destructive" });
  };

  const demoMutation = useMutation({
    mutationFn: createMercadoPagoDemoPurchase,
    onSuccess: (result) => {
      const paymentUrl = result.sandboxInitPoint || result.initPoint || null;
      setCreatedOrderNumber(result.orderNumber);
      setDemoCheckoutUrl(paymentUrl);
      clearCart();
      toast({
        title: "Compra demo criada",
        description: `Pedido #${result.orderNumber} criado. Abrindo checkout do Mercado Pago.`,
      });
      if (paymentUrl) {
        window.open(paymentUrl, "_blank", "noopener,noreferrer");
      }
    },
    onError: (err) => {
      toast({
        title: "Erro na compra demo",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDemoPurchase = () => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens para testar a compra demo.",
        variant: "destructive",
      });
      return;
    }

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const firstItem = items[0];
    const extraItems = Math.max(items.length - 1, 0);
    const unitPrice = totalQuantity > 0 ? Number((cartSubtotal / totalQuantity).toFixed(2)) : 149.9;
    const checkoutBaseUrl = `${window.location.origin}/checkout`;

    demoMutation.mutate({
      customerName: form.customerName.trim() || undefined,
      customerEmail: form.customerEmail.trim() || undefined,
      itemTitle: firstItem ? `${firstItem.name}${extraItems ? ` + ${extraItems} item(ns)` : ""}` : "Compra Demo",
      unitPrice,
      quantity: totalQuantity || 1,
      shippingCost,
      backUrlSuccess: `${checkoutBaseUrl}?payment=success`,
      backUrlFailure: `${checkoutBaseUrl}?payment=failure`,
      backUrlPending: `${checkoutBaseUrl}?payment=pending`,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione produtos antes de finalizar.", variant: "destructive" });
      return;
    }

    mutation.mutate({
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      addressStreet: form.addressStreet,
      addressNumber: form.addressNumber,
      addressComplement: form.addressComplement || undefined,
      addressNeighborhood: form.addressNeighborhood || undefined,
      addressCity: form.addressCity,
      addressState: form.addressState.toUpperCase(),
      addressZip: form.addressZip,
      paymentMethod: form.paymentMethod,
      shippingCost,
      notes: appliedCoupon ? `Cupom aplicado: ${appliedCoupon.code}` : undefined,
      source: "frontend-checkout",
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        variation: item.customName ? `${item.size} | Nome: ${item.customName}` : item.size,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    });
  };

  if (items.length === 0 && !createdOrderNumber) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Seu carrinho está vazio.</p>
          <Link to="/produtos" className="mt-4 inline-block text-primary hover:underline">
            Ver produtos
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-3">
        <section className="md:col-span-2">
          <h1 className="font-heading text-3xl text-foreground">CHECKOUT</h1>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Compra protegida
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
              <PackageCheck className="h-4 w-4 text-primary" /> Pedido rastreável
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
              <CreditCard className="h-4 w-4 text-primary" /> Pix, Cartão e Boleto
            </div>
          </div>

          {createdOrderNumber ? (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/10 p-5">
              <p className="text-lg font-semibold text-foreground">Pedido confirmado: #{createdOrderNumber}</p>
              <p className="mt-2 text-sm text-muted-foreground">Recebemos seu pedido e vamos continuar o atendimento.</p>
              {demoCheckoutUrl && (
                <a
                  href={demoCheckoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Abrir pagamento no Mercado Pago <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <Link to="/produtos" className="mt-4 inline-block text-primary hover:underline">
                Continuar comprando
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
              <input
                required
                placeholder="Nome completo"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
              />
              <input
                required
                type="email"
                placeholder="E-mail"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
              />
              <input
                required
                placeholder="Telefone"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  required
                  placeholder="Rua"
                  value={form.addressStreet}
                  onChange={(e) => setForm({ ...form, addressStreet: e.target.value })}
                  className="col-span-2 rounded-lg border border-border bg-card px-4 py-2 text-sm"
                />
                <input
                  required
                  placeholder="Número"
                  value={form.addressNumber}
                  onChange={(e) => setForm({ ...form, addressNumber: e.target.value })}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
                />
              </div>
              <input
                placeholder="Complemento"
                value={form.addressComplement}
                onChange={(e) => setForm({ ...form, addressComplement: e.target.value })}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
              />
              <input
                placeholder="Bairro"
                value={form.addressNeighborhood}
                onChange={(e) => setForm({ ...form, addressNeighborhood: e.target.value })}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  required
                  placeholder="Cidade"
                  value={form.addressCity}
                  onChange={(e) => setForm({ ...form, addressCity: e.target.value })}
                  className="col-span-2 rounded-lg border border-border bg-card px-4 py-2 text-sm"
                />
                <input
                  required
                  maxLength={2}
                  placeholder="UF"
                  value={form.addressState}
                  onChange={(e) => setForm({ ...form, addressState: e.target.value })}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm uppercase"
                />
              </div>
              <input
                required
                placeholder="CEP"
                value={form.addressZip}
                onChange={(e) => setForm({ ...form, addressZip: e.target.value })}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
              />
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
              >
                <option value="pix">Pix</option>
                <option value="cartao">Cartão</option>
                <option value="boleto">Boleto</option>
              </select>

              <button
                disabled={mutation.isPending}
                className="gradient-primary mt-2 rounded-lg px-6 py-3 font-heading text-lg text-primary-foreground disabled:opacity-60"
              >
                {mutation.isPending ? "FINALIZANDO..." : "FINALIZAR PEDIDO"}
              </button>

              {import.meta.env.DEV && (
                <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm font-semibold text-foreground">Teste de integração (dev)</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cria pedido demo + preferência do Mercado Pago e abre o checkout em nova aba.
                  </p>
                  <button
                    type="button"
                    onClick={handleDemoPurchase}
                    disabled={mutation.isPending || demoMutation.isPending}
                    className="mt-3 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-60"
                  >
                    {demoMutation.isPending ? "GERANDO COMPRA DEMO..." : "COMPRA DEMO (MERCADO PAGO)"}
                  </button>
                </div>
              )}
            </form>
          )}
        </section>

        <aside className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-xl text-foreground">Resumo do Pedido</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.customName || ""}`} className="flex gap-3 border-b border-border pb-3">
                <img src={item.image} alt={item.name} className="h-16 w-12 rounded-md object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Tam: {item.size} · Qtd: {item.quantity}
                  </p>
                  {item.customName && <p className="text-xs text-primary">Nome: {item.customName}</p>}
                  <p className="text-sm font-semibold text-primary">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</p>
                </div>
              </div>
            ))}

            <div className="border-b border-border pb-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {appliedCoupon.code} — {appliedCoupon.label}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-destructive">
                    Remover
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Cupom de desconto"
                    className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                  />
                  <button type="button" onClick={handleApplyCoupon} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                    Aplicar
                  </button>
                </div>
              )}
            </div>

            {quote && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Região: {quote.region} ({quote.state})
                </p>
                <p>Entrega estimada: {quote.estimateDays.min} a {quote.estimateDays.max} dias úteis</p>
              </div>
            )}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>R$ {cartSubtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-primary">
                  <span>Desconto ({appliedCoupon.discount}%)</span>
                  <span>- R$ {discountAmount.toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span>R$ {shippingCost.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-heading text-xl text-foreground">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-foreground">
              <p className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Envio nacional com rastreio.
              </p>
              <p className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" /> Dados salvos após confirmação.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default Checkout;
