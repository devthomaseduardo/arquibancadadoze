import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, Headphones, CreditCard } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import bannerHero from "@/assets/banner-hero.png";
import bannerHero2 from "@/assets/banner-hero-2.png";

const featuredProducts = products.filter((p) => p.badge);
const topCategories = categories.slice(0, 6);

const testimonials = [
  { name: "Lucas M.", text: "Qualidade incrível! Não dá pra diferenciar da original. Entrega rápida!", rating: 5 },
  { name: "Fernanda R.", text: "Comprei pro meu filho e ele amou. O conjunto infantil é perfeito!", rating: 5 },
  { name: "Roberto S.", text: "Já é minha terceira compra. Sempre com qualidade impecável.", rating: 5 },
];

const Index = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [bannerHero, bannerHero2];

  return (
    <Layout>
      {/* Hero with banner carousel */}
      <section className="relative overflow-hidden">
        <div className="relative">
          <img
            src={banners[currentBanner]}
            alt="Pé na Bola - Vista a paixão pelo futebol"
            className="w-full object-cover"
            style={{ maxHeight: "600px" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          {/* Banner dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  currentBanner === i ? "bg-primary w-6" : "bg-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          {[
            { icon: Truck, label: "Envio para todo Brasil" },
            { icon: ShieldCheck, label: "Qualidade Garantida" },
            { icon: Headphones, label: "Atendimento até 18h" },
            { icon: CreditCard, label: "Parcelamos no Cartão" },
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
                <div className="flex gap-1 text-primary">
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
            SIGA A <span className="text-primary">PÉ NA BOLA</span> NAS REDES
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
