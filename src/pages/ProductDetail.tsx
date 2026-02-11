import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState("");

  if (!product) {
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

  const category = categories.find((c) => c.slug === product.categorySlug);

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
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </motion.div>

          {/* Info */}
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
            <p className="mt-3 text-sm text-muted-foreground">{product.team}</p>
            <h1 className="mt-1 font-heading text-4xl text-foreground">{product.name}</h1>
            {category && (
              <Link
                to={`/produtos?cat=${category.slug}`}
                className="mt-1 inline-block text-xs text-primary hover:underline"
              >
                {category.name}
              </Link>
            )}

            <p className="mt-6 font-heading text-4xl text-primary">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              até 3x de R$ {(product.price / 3).toFixed(2).replace(".", ",")} sem juros
            </p>

            <p className="mt-6 text-sm text-foreground/80">{product.description}</p>

            {/* Sizes */}
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

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="gradient-primary flex items-center justify-center gap-2 rounded-lg px-8 py-3 font-heading text-lg text-primary-foreground transition-all hover:opacity-90 neon-glow">
                <ShoppingCart className="h-5 w-5" />
                COMPRAR AGORA
              </button>
              <a
                href={`https://wa.me/5511999999999?text=Olá! Tenho interesse na ${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-8 py-3 font-heading text-lg text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <MessageCircle className="h-5 w-5" />
                WHATSAPP
              </a>
            </div>

            {/* Info */}
            <div className="mt-8 space-y-2 rounded-lg border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
              <p>✅ Qualidade tailandesa garantida</p>
              <p>🚚 Frete fixo a partir de R$ 30,00</p>
              <p>💳 Cartão, Boleto ou Pix</p>
              <p>📦 Envio em até 5 dias úteis</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
