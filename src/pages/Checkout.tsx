import { FormEvent, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BadgeCheck, CreditCard, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import Layout from "@/components/Layout";
import { createOrder, getProductBySlug, getShippingQuote } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { criativos } from "@/data/criativos";
import BannerCarousel from "@/components/BannerCarousel";

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
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const size = searchParams.get("size") || "";
  const customName = (searchParams.get("customName") || "").trim().slice(0, 15).toUpperCase();
  const qty = Math.max(Number(searchParams.get("qty") || "1"), 1);
  const { toast } = useToast();

  const [form, setForm] = useState<CheckoutForm>(defaultForm);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["checkout-product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });

  const subtotal = (product?.priceMin || 0) * qty;
  const stateForQuote = form.addressState.trim().toUpperCase();
  const { data: quote } = useQuery({
    queryKey: ["shipping-quote", stateForQuote, subtotal],
    queryFn: () => getShippingQuote(stateForQuote, subtotal),
    enabled: stateForQuote.length === 2 && subtotal > 0,
  });
  const shippingCost = quote?.finalShippingCost ?? 35;
  const total = subtotal + shippingCost;

  const hasSizeInProduct = useMemo(() => {
    if (!product || !size) return false;
    try {
      const sizes = JSON.parse(product.sizes) as string[];
      return sizes.includes(size);
    } catch {
      return false;
    }
  }, [product, size]);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      setCreatedOrderNumber(order.orderNumber);
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!product || !hasSizeInProduct) {
      toast({ title: "Produto inválido", description: "Selecione o produto novamente.", variant: "destructive" });
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
      source: "frontend-checkout",
      items: [
        {
          productId: product.id,
          productName: product.name,
          variation: customName ? `${size} | Nome: ${customName}` : size,
          quantity: qty,
          unitPrice: product.priceMin,
        },
      ],
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">Carregando checkout...</div>
      </Layout>
    );
  }

  if (isError || !product || !hasSizeInProduct) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <p className="text-destructive">Não foi possível iniciar o checkout.</p>
          <Link to="/produtos" className="mt-4 inline-block text-primary hover:underline">Voltar para produtos</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-3">
        <section className="md:col-span-2">
          <BannerCarousel
            images={[
              { src: criativos.bannerNome, alt: "Personalize sua camisa" },
              { src: criativos.bannerCamisas, alt: "Coleção de camisas" },
            ]}
            className="mb-6 rounded-2xl border border-border"
            showArrows={false}
          />
          <h1 className="font-heading text-3xl text-foreground">CHECKOUT</h1>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Compra protegida
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
              <PackageCheck className="h-4 w-4 text-primary" />
              Pedido rastreável
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Pix, Cartão e Boleto
            </div>
          </div>

          {createdOrderNumber ? (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/10 p-5">
              <p className="text-lg font-semibold text-foreground">Pedido confirmado: #{createdOrderNumber}</p>
              <p className="mt-2 text-sm text-muted-foreground">Recebemos seu pedido e vamos continuar o atendimento.</p>
              <Link to="/produtos" className="mt-4 inline-block text-primary hover:underline">Continuar comprando</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
              <input required placeholder="Nome completo" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm" />
              <input required type="email" placeholder="E-mail" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm" />
              <input required placeholder="Telefone" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <input required placeholder="Rua" value={form.addressStreet} onChange={(e) => setForm({ ...form, addressStreet: e.target.value })} className="col-span-2 rounded-lg border border-border bg-card px-4 py-2 text-sm" />
                <input required placeholder="Número" value={form.addressNumber} onChange={(e) => setForm({ ...form, addressNumber: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm" />
              </div>
              <input placeholder="Complemento" value={form.addressComplement} onChange={(e) => setForm({ ...form, addressComplement: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm" />
              <input placeholder="Bairro" value={form.addressNeighborhood} onChange={(e) => setForm({ ...form, addressNeighborhood: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <input required placeholder="Cidade" value={form.addressCity} onChange={(e) => setForm({ ...form, addressCity: e.target.value })} className="col-span-2 rounded-lg border border-border bg-card px-4 py-2 text-sm" />
                <input required maxLength={2} placeholder="UF" value={form.addressState} onChange={(e) => setForm({ ...form, addressState: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm uppercase" />
              </div>
              <input required placeholder="CEP" value={form.addressZip} onChange={(e) => setForm({ ...form, addressZip: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm" />
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm">
                <option value="pix">Pix</option>
                <option value="cartao">Cartão</option>
                <option value="boleto">Boleto</option>
              </select>

              <button disabled={mutation.isPending} className="gradient-primary mt-2 rounded-lg px-6 py-3 font-heading text-lg text-primary-foreground disabled:opacity-60">
                {mutation.isPending ? "FINALIZANDO..." : "FINALIZAR PEDIDO"}
              </button>
            </form>
          )}
        </section>

        <aside className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-xl text-foreground">Resumo</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-foreground">{product.name}</p>
            <p className="text-muted-foreground">Tamanho: {size}</p>
            {customName && <p className="text-muted-foreground">Personalização: {customName}</p>}
            <p className="text-muted-foreground">Qtd: {qty}</p>
            {quote && (
              <>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Região: {quote.region} ({quote.state})
                </p>
                <p className="text-muted-foreground">
                  Entrega estimada: {quote.estimateDays.min} a {quote.estimateDays.max} dias úteis
                </p>
                <p className="text-muted-foreground">
                  {quote.isFreeShipping ? "Frete grátis aplicado." : `Frete base da região: R$ ${quote.baseShipping.toFixed(2).replace(".", ",")}`}
                </p>
              </>
            )}
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace(".", ",")}</span></div>
              <div className="mt-1 flex justify-between"><span>Frete</span><span>R$ {shippingCost.toFixed(2).replace(".", ",")}</span></div>
              <div className="mt-2 flex justify-between font-semibold text-primary"><span>Total</span><span>R$ {total.toFixed(2).replace(".", ",")}</span></div>
            </div>
            <div className="mt-4 space-y-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-foreground">
              <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Envio nacional com atualização de status.</p>
              <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> Dados salvos no sistema após confirmação.</p>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default Checkout;
