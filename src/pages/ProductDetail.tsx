import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, MessageCircle, Ruler, Star, Truck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { getProductBySlug } from "@/lib/api";
import { getCatalogInfoByMediaPath, getTeamByMediaPath, getUploadedMediaForCategorySlug, toStoreProductDetail } from "@/lib/store-mappers";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import ProductGallery from "@/components/ProductGallery";
import { formatCurrency } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProductDetail = () => {
  const { slug } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [finalPrice, setFinalPrice] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug as string),
    enabled: Boolean(slug),
  });

  const product = data ? toStoreProductDetail(data) : null;
  const gallery = useMemo(() => {
    if (!product) return [];
    const media = getUploadedMediaForCategorySlug(product.categorySlug);
    const list = [product.image, ...media];
    return [...new Set(list)];
  }, [product]);
  const activeImage = gallery[0] || product?.image; // Initial fallback
  const catalogInfo = activeImage ? getCatalogInfoByMediaPath(activeImage) : null;
  const teamName = catalogInfo?.clube || (activeImage ? getTeamByMediaPath(activeImage) : "Não identificado");
  const personalizationCost = (customName || customNumber) ? 15 : 0;

  useEffect(() => {
    if (product) {
      setFinalPrice(product.priceMin + personalizationCost);
    }
  }, [product, personalizationCost]);

  useEffect(() => {
    setSelectedSize("");
    setCustomName("");
    setCustomNumber("");
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast({ title: "Selecione um tamanho", description: "Escolha o tamanho antes de adicionar.", variant: "destructive" });
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: selectedSize,
      customName: customName.trim().toUpperCase() || undefined,
      price: product.priceMin,
      quantity: 1,
      categorySlug: product.categorySlug,
    });
    toast({ title: "Adicionado ao carrinho!", description: `${product.name} (${selectedSize})` });
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!selectedSize) {
      toast({ title: "Selecione um tamanho", description: "Escolha o tamanho antes de continuar.", variant: "destructive" });
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: selectedSize,
      customName: customName.trim().toUpperCase() || undefined,
      price: product.priceMin,
      quantity: 1,
      categorySlug: product.categorySlug,
    });
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Carregando produto...</div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Produto não encontrado.</p>
          <Link to="/produtos" className="mt-4 inline-block text-primary hover:underline">
            Voltar aos produtos
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/produtos"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar aos produtos
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <ProductGallery images={gallery.length > 0 ? gallery : [product.image]} productName={product.name} />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {product.badge && (
              <span className="inline-block rounded bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white mb-2">
                {product.badge}
              </span>
            )}

            <div className="flex items-center gap-2 text-sm text-primary font-bold uppercase tracking-widest">
              <span>{teamName}</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>{product.categoryName}</span>
            </div>

            <h1 className="mt-2 font-heading text-3xl md:text-5xl text-white leading-tight">{product.name}</h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex text-primary">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-primary" />)}
              </div>
              <span className="text-sm text-muted-foreground">(4.9/5 - 120 avaliações)</span>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-white/5 bg-zinc-900/50">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">R$ {(product.priceMin * 1.4).toFixed(2).replace(".", ",")}</span>
                <span className="font-heading text-4xl text-white">{formatCurrency(finalPrice)}</span>
              </div>
              <p className="text-green-400 text-sm font-medium mt-1">
                5% de desconto no PIX: <span className="font-bold">{formatCurrency(finalPrice * 0.95)}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ou em até 12x no cartão de crédito
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white uppercase tracking-wide">Selecionar Tamanho</span>
                <button className="text-xs text-primary underline flex items-center gap-1 hover:text-white transition-colors">
                  <Ruler className="h-3 w-3" /> Guia de Medidas
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 rounded-lg border text-sm font-bold transition-all relative overflow-hidden ${selectedSize === size
                      ? "border-primary bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                      : "border-white/10 bg-zinc-900 text-white hover:border-white/30 hover:bg-zinc-800"
                      }`}
                  >
                    {size}
                    {selectedSize === size && (
                      <motion.div layoutId="size-check" className="absolute inset-0 border-2 border-white/20 rounded-lg pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-2">Personalização (+ R$ 15,00)</h3>
                <p className="text-xs text-muted-foreground mb-4">Adicione Nome e Número para tornar seu manto único.</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase">Nome</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value.slice(0, 15).toUpperCase())}
                      placeholder="Ex: RONALDO"
                      maxLength={15}
                      className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary uppercase placeholder:text-zinc-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase">Número</label>
                    <input
                      type="text"
                      value={customNumber}
                      onChange={(e) => setCustomNumber(e.target.value.slice(0, 2).replace(/\D/g, ''))}
                      placeholder="Ex: 9"
                      maxLength={2}
                      className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleBuyNow}
                className="w-full gradient-primary flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-heading text-xl text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                <ShoppingCart className="h-5 w-5" />
                COMPRAR AGORA
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-heading text-sm text-white hover:bg-white/10 transition-colors uppercase tracking-wider"
                >
                  Adicionar à Sacola
                </button>
                <a
                  href={`https://wa.me/5511999999999?text=Olá! Tenho interesse na ${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 font-heading text-sm text-green-500 hover:bg-green-500/20 transition-colors uppercase tracking-wider"
                >
                  <MessageCircle className="h-4 w-4" />
                  Dúvidas no Whats
                </a>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/20 via-background to-secondary/30 p-4 text-sm">
              <p className="font-semibold text-primary">MODO TORCIDA ATIVADO</p>
              <p className="mt-2 text-foreground/90">Vista as cores do seu time com estilo de arquibancada e caimento premium.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
                <p>✅ Qualidade premium garantida</p>
                <p>🚚 Frete fixo por região</p>
                <p>💳 Cartão, Boleto ou Pix</p>
                <p>📦 Envio em até 5 dias úteis</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
