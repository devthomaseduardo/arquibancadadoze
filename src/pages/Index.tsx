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
  { name: "Lucas M.", text: "Qualidade acima do esperado. O tecido é confortável e bem acabado.", rating: 5 },
  { name: "Fernanda R.", text: "Comprei o conjunto infantil e meu filho adorou. Ótimo material.", rating: 5 },
  { name: "Roberto S.", text: "Já é minha terceira compra. Sempre recebo dentro do prazo.", rating: 5 },
  { name: "Mariana L.", text: "Veio bem embalado, com rastreio e atendimento rápido.", rating: 5 },
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
      <section className="relative stadium-light bg-black py-0">
        <BannerCarousel
          images={[
            { src: criativos.bannerPrincipal, alt: "Arquibancada 12 - Vista a paixão pelo futebol" },
            { src: criativos.bannerSecundario, alt: "Coleção torcida" },
            { src: criativos.bannerCamisas, alt: "Camisas premium" },
          ]}
          className="w-full"
          imgClassName="h-full w-full object-cover"
          aspectClassName="aspect-[21/7] md:aspect-[16/5]"
          objectPosition="center top"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container mx-auto px-4 pb-8 md:pb-10">
            <div className="max-w-2xl rounded-2xl border border-white/15 bg-black/45 p-5 backdrop-blur md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Arquibancada 12</p>
              <h1 className="mt-2 font-heading text-4xl leading-[0.9] text-neon-glow text-foreground md:text-6xl">
                Vista a paixão.
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                Não é só camisa. É identidade de torcida com acabamento premium e presença de estádio.
              </p>
              <p className="mt-2 max-w-xl text-xs text-muted-foreground md:text-sm">
                Selecionamos modelos com alto nível de fidelidade visual, tecido confortável e detalhes que fazem diferença no uso real.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/produtos" className="gradient-primary rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                  Ver Coleção
                </Link>
                <Link to="/produtos?cat=retro-tailandesas" className="rounded-lg border border-white/25 bg-black/20 px-5 py-2.5 text-sm text-foreground hover:border-primary">
                  Explorar Retrô
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/20 py-10">
        <div className="container mx-auto grid grid-cols-2 gap-x-4 gap-y-6 px-4 md:grid-cols-4">
          {[
            { icon: Truck, label: "Envio para todo Brasil" },
            { icon: ShieldCheck, label: "Qualidade garantida" },
            { icon: Headphones, label: "Atendimento até 18h" },
            { icon: CreditCard, label: "Parcelamento facilitado no cartão" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="glass-card flex items-center gap-3 rounded-xl px-4 py-5 shadow-md shadow-primary/10"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">SOBRE A MARCA</h2>
          <div className="mt-5 grid gap-4 text-sm leading-relaxed text-muted-foreground md:grid-cols-3">
            <p className="glass-card rounded-xl p-4">
              A Arquibancada 12 nasceu para quem vive o futebol além do campo.
            </p>
            <p className="glass-card rounded-xl p-4">
              Aqui não trabalhamos com qualquer peça. Cada modelo é escolhido pelo padrão de acabamento, conforto e fidelidade aos detalhes originais.
            </p>
            <p className="glass-card rounded-xl p-4">
              Nossa proposta é simples: oferecer camisas que representem a paixão do torcedor com qualidade e presença.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-primary/30 bg-primary/5 py-6">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-3 px-4 text-sm font-semibold uppercase tracking-wide text-primary">
          {[
            { icon: Shirt, label: "Torcida na arquibancada" },
            { icon: Medal, label: "Camisas com identidade" },
            { icon: Percent, label: "Personalização com nome" },
            { icon: ShieldCheck, label: "Qualidade premium" },
            { icon: Truck, label: "Envio para todo o Brasil" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 shadow-sm shadow-primary/10"
            >
              <Icon className="h-4 w-4" />
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-black via-secondary/70 to-black py-12">
        <div className="container mx-auto px-4 pb-6">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">NOSSOS DIFERENCIAIS</h2>
        </div>
        <div className="container mx-auto grid gap-5 px-4 md:grid-cols-4">
          {[
            { icon: Shirt, title: "Personalização Profissional", text: "Nome e número aplicados com estampa de alta fixação e excelente durabilidade." },
            { icon: Clock3, title: "Despacho Ágil", text: "Separação rápida e rastreio por pedido." },
            { icon: Percent, title: "Transparência", text: "Faixa de preço clara por categoria, sem surpresas no final da compra." },
            { icon: Medal, title: "Padrão Premium", text: "Modelagens confortáveis, tecido respirável e costura reforçada." },
          ].map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-primary/30 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-primary/10 p-5 shadow-lg shadow-primary/20 backdrop-blur"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-body text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="spray-texture py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-3xl text-foreground md:text-4xl">CATEGORIAS</h2>
            <Link to="/produtos" className="text-sm text-primary hover:underline">
              Ver todas as categorias
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="py-14">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">SEÇÃO DE CONFIANÇA</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="glass-card rounded-xl p-4 text-sm text-muted-foreground">
              Mais de 2.000 camisas enviadas para todo o Brasil.
            </div>
            <div className="glass-card rounded-xl p-4 text-sm text-muted-foreground">
              Avaliação média de 4,9 baseada em feedbacks reais.
            </div>
            <div className="glass-card rounded-xl p-4 text-sm text-muted-foreground">
              Grande parte dos clientes retorna para novas compras.
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {["Compra protegida.", "Pagamento seguro.", "Rastreamento após envio.", "Suporte direto via WhatsApp."].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-card/60 px-4 py-3 text-sm text-foreground">
                {item}
              </div>
            ))}
          </div>
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
          <div className="mt-5 rounded-xl border border-border bg-card/50 p-5">
            <h2 className="font-heading text-3xl text-foreground md:text-4xl">Deixe sua marca na arquibancada.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Personalize sua camisa com nome e número aplicados com padrão profissional de fixação e durabilidade.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ideal para quem quer exclusividade sem abrir mão da qualidade.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-foreground md:text-4xl">O QUE DIZEM NOSSOS CLIENTES</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
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

      <section className="border-y border-border bg-secondary/20 py-14 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-4xl text-foreground md:text-6xl">Arquibancada 12</h2>
          <p className="mt-2 text-lg text-primary">Paixão que transcende o campo.</p>
          <p className="mt-5 text-sm text-muted-foreground md:text-base">
            Vista o jogo. <br className="md:hidden" />
            Represente sua história. <br className="md:hidden" />
            Entre para a arquibancada.
          </p>
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
