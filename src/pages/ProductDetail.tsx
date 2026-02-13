
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, MessageCircle, Ruler, Star, Truck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { getProductBySlug } from "../lib/api";
import { toStoreProductDetail } from "../lib/store-mappers";
import { useCart } from "../contexts/CartContext";
import { formatCurrency } from "../lib/utils";
import { toast } from "sonner";

const ProductDetail = () => {
  const { slug } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [customName, setCustomName] = useState("");
  const navigate = useNavigate();
  const { addItem } = useCart();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug as string),
    enabled: Boolean(slug),
  });

  const product = data ? toStoreProductDetail(data) : null;

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Selecione um tamanho", { description: "Escolha o tamanho antes de adicionar." });
      return;
    }
    // Fix: Adding baseCost to satisfy the CartItem interface requirements
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: selectedSize,
      customName: customName.trim().toUpperCase() || undefined,
      price: product.priceMin,
      baseCost: product.baseCost,
      quantity: 1,
      categorySlug: product.categorySlug,
    });
    toast.success("Adicionado ao carrinho!", { description: `${product.name} (${selectedSize})` });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (selectedSize) {
      navigate("/checkout");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-zinc-500">Carregando produto...</div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-zinc-500">Produto não encontrado.</p>
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
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar aos produtos
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <img src={product.image} alt={product.name} className="w-full object-cover" />
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

            <div className="text-sm text-primary font-bold uppercase tracking-widest">
              {product.team} | {product.categoryName}
            </div>

            <h1 className="mt-2 font-heading text-3xl md:text-5xl text-white leading-tight">{product.name}</h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex text-primary">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-primary" />)}
              </div>
              <span className="text-sm text-zinc-500">(4.9/5 - 120 avaliações)</span>
            </div>

            <div className="mt-6">
              <span className="font-heading text-4xl text-white">{formatCurrency(product.priceMin)}</span>
              <p className="text-zinc-500 text-sm mt-1">Em até 12x no cartão de crédito</p>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white uppercase">Selecionar Tamanho</span>
                <button className="text-xs text-primary underline flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Guia de Medidas
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 rounded-lg border text-sm font-bold transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-white"
                        : "border-zinc-800 bg-zinc-900 text-white hover:border-zinc-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase">Personalizar com Nome (Opcional)</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value.slice(0, 15).toUpperCase())}
                  placeholder="EX: RONALDO"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full gradient-primary rounded-lg py-4 font-heading text-xl text-white transition-all hover:scale-[1.01]"
                >
                  COMPRAR AGORA
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full rounded-lg border border-zinc-800 py-3 font-heading text-sm text-white hover:bg-zinc-900"
                >
                  ADICIONAR À SACOLA
                </button>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-zinc-800 p-4 text-xs text-zinc-400 space-y-2">
              <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Envio nacional com rastreio em 5 dias.</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Garantia total de satisfação Arquibancada 12.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
