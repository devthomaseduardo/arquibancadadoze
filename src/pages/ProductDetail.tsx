import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, MessageCircle, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { getProductBySlug } from "@/lib/api";
import { getTeamByMediaPath, getUploadedMediaForCategorySlug, toStoreProductDetail } from "@/lib/store-mappers";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

const ProductDetail = () => {
  const { slug } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [customName, setCustomName] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();

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
  const activeImage = gallery[activeImageIndex] || product?.image;
  const teamName = activeImage ? getTeamByMediaPath(activeImage) : "Não identificado";

  useEffect(() => {
    setActiveImageIndex(0);
  }, [slug]);

  const nextImage = () => {
    if (gallery.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % gallery.length);
  };
  const prevImage = () => {
    if (gallery.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

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
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative overflow-hidden rounded-lg border border-border bg-card"
            >
              <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/80 p-2 text-foreground backdrop-blur hover:border-primary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/80 p-2 text-foreground backdrop-blur hover:border-primary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </motion.div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.slice(0, 10).map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`overflow-hidden rounded-md border ${idx === activeImageIndex ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="h-16 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {product.badge && (
              <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                {product.badge}
              </span>
            )}
            <p className="mt-3 text-sm text-muted-foreground">{teamName}</p>
            <h1 className="mt-1 font-heading text-4xl text-foreground">{product.name}</h1>
            <Link
              to={`/produtos?cat=${product.categorySlug}`}
              className="mt-1 inline-block text-xs text-primary hover:underline"
            >
              {product.categoryName}
            </Link>

            <p className="mt-6 font-heading text-4xl text-primary">R$ {product.priceMin.toFixed(2).replace(".", ",")}</p>
            {product.priceMax > product.priceMin && (
              <p className="mt-1 text-sm text-foreground/80">
                Faixa sugerida: <strong>R$ {product.priceMin.toFixed(2).replace(".", ",")} a R$ {product.priceMax.toFixed(2).replace(".", ",")}</strong>
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              até 3x de R$ {(product.priceMin / 3).toFixed(2).replace(".", ",")} sem juros
            </p>

            <p className="mt-6 text-sm text-foreground/80">{product.description || "Produto sem descrição."}</p>

            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-foreground">Tamanho:</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground neon-glow"
                        : "border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Nome para personalização (opcional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value.slice(0, 15))}
                placeholder="Ex: THOMAS"
                maxLength={15}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Até 15 caracteres para estampar na camisa.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleBuyNow}
                className="gradient-primary flex items-center justify-center gap-2 rounded-lg px-8 py-3 font-heading text-lg text-primary-foreground transition-all hover:opacity-90 neon-glow"
              >
                <ShoppingCart className="h-5 w-5" />
                COMPRAR AGORA
              </button>
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 rounded-lg border border-primary px-8 py-3 font-heading text-lg text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="h-5 w-5" />
                ADICIONAR AO CARRINHO
              </button>
            </div>
            <a
              href={`https://wa.me/5511999999999?text=Olá! Tenho interesse na ${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border px-8 py-3 font-heading text-lg text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-5 w-5" />
              WHATSAPP
            </a>

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
