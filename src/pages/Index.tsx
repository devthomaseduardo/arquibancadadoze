import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, Headphones } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import heroBanner from "@/assets/hero-banner.jpg";

const featuredProducts = products.filter((p) => p.badge);
const topCategories = categories.slice(0, 6);

const testimonials = [
  { name: "Lucas M.", text: "Qualidade incrível! Não dá pra diferenciar da original. Entrega rápida!", rating: 5 },
  { name: "Fernanda R.", text: "Comprei pro meu filho e ele amou. O conjunto infantil é perfeito!", rating: 5 },
  { name: "Roberto S.", text: "Já é minha terceira compra. Sempre com qualidade impecável.", rating: 5 },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="Torcida Urbana" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        </div>
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <h1 className="font-heading text-5xl leading-tight text-foreground md:text-7xl">
              VISTA A SUA{" "}
              <span className="text-primary text-neon-glow">PAIXÃO</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Camisas de futebol com qualidade tailandesa e estilo urbano. 
              Os melhores times, os melhores preços.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/produtos"
                className="gradient-primary inline-flex items-center gap-2 rounded-lg px-8 py-3 font-heading text-lg tracking-wide text-primary-foreground transition-all hover:opacity-90 neon-glow"
              >
                VER PRODUTOS <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="https://wa.me/5511999999999"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3 font-heading text-lg tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                WHATSAPP
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto grid grid-cols-1 gap-4 px-4 py-6 md:grid-cols-3">
          {[
            { icon: Truck, label: "Entrega para todo Brasil" },
            { icon: ShieldCheck, label: "Qualidade Garantida" },
            { icon: Headphones, label: "Atendimento até 18h" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Icon className="h-5 w-5 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="spray-texture py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-3xl text-foreground md:text-4xl">
              CATEGORIAS
            </h2>
            <Link to="/produtos" className="text-sm text-primary hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {topCategories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">
            DESTAQUES
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="border-y border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">
            🔥 FRETE FIXO A PARTIR DE <span className="text-primary">R$ 30</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Entrega rápida e segura para todo o Brasil
          </p>
          <Link
            to="/frete"
            className="mt-6 inline-block rounded-lg border border-primary px-6 py-2 font-heading text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            VER TABELA DE FRETE
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">
            O QUE DIZEM NOSSOS CLIENTES
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="flex gap-1 text-accent">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-card-foreground">"{t.text}"</p>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-secondary/30 py-12 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl text-foreground md:text-3xl">
            SIGA A <span className="text-primary">TORCIDA URBANA</span> NAS REDES
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Novidades, promoções exclusivas e lançamentos em primeira mão
          </p>
          <div className="mt-6 flex justify-center gap-4">
            {["Instagram", "Facebook", "TikTok"].map((social) => (
              <a
                key={social}
                href="#"
                className="rounded-lg border border-border px-6 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
