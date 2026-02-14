
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, Headphones, CreditCard, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import BannerCarousel from "../components/BannerCarousel";
import PromoBanner from "../components/PromoBanner";
import TrackingInput from "../components/TrackingInput";
import { getCategories, getProducts } from "../lib/api";
import { toStoreCategory, toStoreProduct } from "../lib/store-mappers";
import { criativos } from "../data/criativos";
import { uploadedCriativos } from "../data/uploaded-media";
import { CLUBES_BRASILEIROS } from "../data/clubes-brasileiros";

const Index = () => {
  const { data: rawCategories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: rawProducts = [], isLoading: loadingProducts } = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });

  const categories = rawCategories.map(toStoreCategory);
  const products = rawProducts.map(toStoreProduct);
  const topCategories = categories.slice(0, 6);
  const featuredProducts = products.slice(0, 8);

  return (
    <Layout>
      <PromoBanner />
      <section className="relative w-full h-[85vh] md:h-screen bg-black overflow-hidden">
        <div className="absolute inset-0">
          <BannerCarousel
            images={[
              { src: criativos.bannerPrincipal, alt: "Arquibancada 12" },
              { src: criativos.bannerSecundario, alt: "Coleção torcida" },
              { src: criativos.bannerCamisas, alt: "Catálogo de camisas" },
              { src: criativos.bannerNome, alt: "Vista a paixão" },
            ]}
            className="w-full h-full"
            aspectClassName="h-full"
            imgClassName="h-full w-full object-cover absolute inset-0 transition-opacity duration-700"
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center bg-gradient-to-t from-black/80 via-transparent to-transparent pb-12 md:pb-20 pointer-events-none">
          <h1 className="font-fat text-5xl text-white drop-shadow-2xl md:text-[120px] tracking-tighter uppercase leading-none text-center">
            Arquibancada <span className="text-primary">12</span>
          </h1>
          <p className="mt-4 font-body text-xs uppercase tracking-[0.6em] text-white/80 md:text-lg font-bold">
            Vista a paixão
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 bg-black py-12">
        <div className="container mx-auto grid grid-cols-2 gap-x-8 gap-y-10 px-4 md:grid-cols-4">
          {[
            { icon: Truck, label: "Envio Nacional", desc: "Todo Brasil" },
            { icon: ShieldCheck, label: "Compra Segura", desc: "Garantia total" },
            { icon: Headphones, label: "Suporte Premium", desc: "Especializado" },
            { icon: CreditCard, label: "Até 12x", desc: "Parcelamento" },
          ].map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group flex flex-col items-center text-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-6">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="block font-heading text-lg tracking-tight text-white uppercase">{label}</span>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-950 py-20">
        <div className="container mx-auto px-4 mb-8">
          <Link
            to="/produtos?cat=camisas-nacionais-premium"
            className="group block overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-8 md:p-12 transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/20"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-primary font-bold text-xs uppercase tracking-[0.3em]">Destaque</span>
                <h2 className="font-heading text-3xl md:text-5xl text-white mt-2 group-hover:text-primary transition-colors">
                  Camisas de Seleção
                </h2>
                <p className="mt-3 text-zinc-400 max-w-xl">
                  Mantos oficiais e retrôs da Seleção Brasileira e seleções do mundo. Tecido premium, acabamento 1:1.
                </p>
                <span className="inline-flex items-center gap-2 mt-4 text-primary font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
                  Ver coleção <ChevronRight className="h-4 w-4" />
                </span>
              </div>
              <div className="flex-1 max-w-xs mx-auto md:mx-0">
                <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-6xl">🇧🇷</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="container mx-auto px-4 mb-16">
          <h2 className="font-heading text-2xl md:text-3xl text-white mb-6 text-center uppercase tracking-tight">
            Escolha seu time
          </h2>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {CLUBES_BRASILEIROS.map((clube, i) => (
              <Link key={clube.slug} to={`/produtos?busca=${encodeURIComponent(clube.searchTerm)}`} className="group">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  whileHover={{ scale: 1.1, y: -4 }}
                  className="flex h-14 w-14 md:h-16 md:w-16 rounded-full border-2 border-white/10 bg-zinc-900 items-center justify-center text-lg md:text-xl font-bold text-white/90 transition-all group-hover:border-primary group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20"
                  title={clube.name}
                >
                  {clube.name.slice(0, 2)}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-heading text-4xl text-white md:text-6xl">Categorias</h2>
            <Link to="/produtos" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCategories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-zinc-950 border-y border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl md:text-3xl text-white mb-8 text-center uppercase tracking-tight">
            A torcida em campo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-4xl mx-auto">
            {uploadedCriativos
              .filter((src) => /\.(jpg|jpeg|png|webp)$/i.test(src))
              .map((src, i) => (
                <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 shadow-xl hover:shadow-primary/10 transition-shadow">
                  <img src={src} alt={`Torcida ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-white md:text-5xl mb-12">Destaques</h2>
          {loadingProducts ? (
            <div className="flex justify-center py-20">
               <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <TrackingInput />
    </Layout>
  );
};

export default Index;
