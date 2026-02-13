import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, Headphones, CreditCard, Shirt, Clock3, Percent, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { getCategories, getProducts } from "@/lib/api";
import { getTeamByMediaPath, getUploadedMediaForCategorySlug, toStoreCategory, toStoreProduct } from "@/lib/store-mappers";
import { criativos } from "@/data/criativos";
import BannerCarousel from "@/components/BannerCarousel";
import PromoBanner from "@/components/PromoBanner";

const testimonials = [
  { name: "Lucas M.", text: "Qualidade incrível! Não dá pra diferenciar da original. Entrega rápida!", rating: 5 },
  { name: "Fernanda R.", text: "Comprei pro meu filho e ele amou. O conjunto infantil é perfeito!", rating: 5 },
  { name: "Roberto S.", text: "Já é minha terceira compra. Sempre com qualidade impecável.", rating: 5 },
];

const Index = () => {
  const { data: rawCategories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: rawProducts = [], isLoading: loadingProducts } = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });

  const categories = rawCategories.map(toStoreCategory);
  const products = rawProducts.flatMap((rawProduct) => {
    const baseProduct = toStoreProduct(rawProduct);
    const media = getUploadedMediaForCategorySlug(rawProduct.category.slug);
    if (media.length === 0) return [baseProduct];

    return media.map((image, index) => ({
      ...baseProduct,
      id: `${baseProduct.id}-${index + 1}`,
      image,
      team: getTeamByMediaPath(image),
      badge: index === 0 ? baseProduct.badge : undefined,
    }));
  });
  const topCategories = categories.slice(0, 6);
  const featuredProducts = products.slice(0, 8);

  return (
    <Layout>
      <PromoBanner />
      <section className="relative bg-black py-2">
        <BannerCarousel
          images={[
            { src: criativos.bannerPrincipal, alt: "Arquibancada 12 - Vista a paixão pelo futebol" },
            { src: criativos.bannerSecundario, alt: "Coleção torcida" },
            { src: criativos.bannerCamisas, alt: "Camisas premium" },
          ]}
          className="w-full"
          imgClassName="h-full w-full object-cover"
          aspectClassName="aspect-[3/2]"
        />
      </section>

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

      <section className="overflow-hidden border-y border-primary/30 bg-primary/10 py-3">
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap text-sm font-semibold tracking-wider text-primary"
        >
          {Array.from({ length: 2 }).map((_, block) => (
            <div key={block} className="mr-10 flex gap-8">
              <span>TORCIDA NA ARQUIBANCADA</span>
              <span>CAMISAS COM IDENTIDADE</span>
              <span>PERSONALIZAÇÃO COM NOME</span>
              <span>QUALIDADE PREMIUM</span>
              <span>ENVIO PARA TODO O BRASIL</span>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="bg-gradient-to-r from-black via-secondary/70 to-black py-10">
        <div className="container mx-auto grid gap-4 px-4 md:grid-cols-4">
          {[
            { icon: Shirt, title: "Personalização Real", text: "Nome e número com estampa de alta fixação." },
            { icon: Clock3, title: "Despacho Ágil", text: "Separação rápida e rastreio por pedido." },
            { icon: Percent, title: "Faixa de Preço Clara", text: "Valores sugeridos por categoria e time." },
            { icon: Medal, title: "Padrão Premium", text: "Modelagens com foco em conforto de torcedor." },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-xl border border-primary/20 bg-card/60 p-4 shadow-lg shadow-primary/10">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-2 font-body text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="spray-texture py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-3xl text-foreground md:text-4xl">CATEGORIAS</h2>
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

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">DESTAQUES</h2>
          {loadingProducts ? (
            <p className="mt-8 text-sm text-muted-foreground">Carregando produtos...</p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">
            🔥 FRETE FIXO A PARTIR DE <span className="text-primary">R$ 30</span>
          </h2>
          <p className="mt-2 text-muted-foreground">Entrega rápida e segura para todo o Brasil</p>
          <Link
            to="/frete"
            className="mt-6 inline-block rounded-lg border border-primary px-6 py-2 font-heading text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            VER TABELA DE FRETE
          </Link>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <BannerCarousel
            images={[
              { src: criativos.bannerCamisas, alt: "Coleção de camisas" },
              { src: criativos.bannerNome, alt: "Personalize sua camisa" },
            ]}
            className="rounded-2xl border border-border"
          />
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">O QUE DIZEM NOSSOS CLIENTES</h2>
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

      <section className="border-t border-border bg-secondary/30 py-12 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl text-foreground md:text-3xl">
            SIGA A <span className="text-primary">ARQUIBANCADA 12</span> NAS REDES
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
