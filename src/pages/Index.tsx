import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, Headphones, CreditCard, Shirt, Clock3, Percent, Medal, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import TrackingInput from "@/components/TrackingInput";
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-10 left-0 right-0 z-10 text-center">
          <h1 className="font-heading text-5xl text-white drop-shadow-2xl md:text-8xl tracking-widest uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Arquibancada</span> <span className="text-primary">12</span>
          </h1>
          <p className="mt-2 font-body text-sm uppercase tracking-[0.5em] text-white/80 md:text-base">
            Vista a paixão
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 bg-black py-12">
        <div className="container mx-auto grid grid-cols-2 gap-x-8 gap-y-10 px-4 md:grid-cols-4">
          {[
            { icon: Truck, label: "Envio Nacional", desc: "Entrega em todo Brasil" },
            { icon: ShieldCheck, label: "Compra Segura", desc: "Garantia total de entrega" },
            { icon: Headphones, label: "Suporte Premium", desc: "Atendimento especializado" },
            { icon: CreditCard, label: "Até 12x", desc: "Parcelamento facilitado" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="group flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="block font-heading text-lg tracking-wide text-white">{label}</span>
                <span className="block text-xs uppercase tracking-wider text-muted-foreground">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="font-heading text-4xl text-white md:text-6xl mb-6">SOBRE A <span className="text-primary">MARCA</span></h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  A Arquibancada 12 não é apenas uma loja. É um manifesto de quem vive o futebol além das quatro linhas.
                </p>
                <p>
                  Nascemos da necessidade de vestir a paixão com qualidade real. Sem tecidos frágeis, sem estampas que descolam. Apenas o padrão que sua torcida merece.
                </p>
                <Link to="/sobre" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium mt-4">
                  Conheça nossa história <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-video rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
              {/* Placeholder for visuals or keeping it abstract/minimal */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="font-heading text-9xl text-white/5 select-none">A12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Torcida na Arquibancada removida conforme pedido (era redundante e feia) */}

      <section className="bg-zinc-950 py-20 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-heading text-3xl text-white md:text-5xl">NOSSOS <span className="text-gradient-primary">DIFERENCIAIS</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl">Por que quem compra na Arquibancada 12 sempre volta.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              { icon: Shirt, title: "Qualidade de Jogo", text: "Tecidos tecnológicos que respiram e duram temporadas inteiras." },
              { icon: Medal, title: "Acabamento Pro", text: "Costuras reforçadas e detalhes fiéis aos mantos de jogo." },
              { icon: Clock3, title: "Envio Ágil", text: "Processamento rápido para você vestir seu manto o quanto antes." },
              { icon: ShieldCheck, title: "Compra Garantida", text: "Processo transparente do pedido até a entrega." },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group rounded-xl border border-white/5 bg-zinc-900/50 p-6 hover:border-primary/30 hover:bg-zinc-900 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl text-white mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="spray-texture py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-heading text-4xl text-white md:text-5xl">CATEGORIAS</h2>
            <Link to="/produtos" className="hidden md:flex items-center gap-2 text-sm text-primary hover:text-white transition-colors">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {topCategories.map((cat, i) => (
                <CarouselItem key={cat.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <CategoryCard category={cat} index={i} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-6">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>

          <div className="mt-8 text-center md:hidden">
            <Link to="/produtos" className="text-sm text-primary hover:underline">
              Ver todas as categorias
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl text-white md:text-4xl mb-2">DESTAQUES DA SEMANA</h2>
              <p className="text-sm text-muted-foreground">As peças mais cobiçadas da arquibancada com qualidade de jogo.</p>
            </div>
          </div>
          {loadingProducts ? (
            <p className="mt-8 text-sm text-muted-foreground">Carregando produtos...</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-white/10 p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opactiy-50" />
            <h2 className="font-heading text-3xl text-white md:text-4xl mb-6">COMPRA SEGURA E GARANTIDA</h2>

            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto z-10 relative">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white mb-2">Garantia de Entrega</h3>
                <p className="text-sm text-muted-foreground">Receba seu produto ou devolvemos seu dinheiro. Transparência total no rastreio.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500 mb-4">
                  <Medal className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white mb-2">Qualidade Premium</h3>
                <p className="text-sm text-muted-foreground">Satisfação comprovada por milhares de clientes. Tecido e acabamento de alto nível.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-500/10 text-purple-500 mb-4">
                  <Headphones className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white mb-2">Suporte Humanizado</h3>
                <p className="text-sm text-muted-foreground">Dúvidas? Chama a gente no WhatsApp. Atendimento de torcedor para torcedor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 overflow-hidden bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl text-white md:text-5xl uppercase">Paixão que <span className="text-primary">transcede</span> o campo</h2>
            <p className="text-muted-foreground mt-2">Da arquibancada para a vida. Vista o orgulho do seu time.</p>
          </div>

          <div className="relative">
            {/* Marquee effect simulation or grid of lifestyle photos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900 group relative">
                  {/* Placeholder for lifestyle images */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <p className="text-white font-heading text-lg">Cliente A12</p>
                    <p className="text-white/60 text-xs">@arquibancada12</p>
                  </div>
                  <img
                    src={`https://images.unsplash.com/photo-15${i}1234567890`} // Placeholder URL structure
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-80"
                    alt="Lifestyle"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-white md:text-4xl text-center mb-10">O QUE DIZEM NOSSOS CLIENTES</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur"
              >
                <div className="flex gap-1 text-primary mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-lg">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-300 italic mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">{t.name}</p>
                </div>
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

      <TrackingInput />

      <section className="border-t border-white/5 bg-zinc-950 py-12 text-center">
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
