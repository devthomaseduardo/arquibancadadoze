
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
      <section className="relative bg-black py-0">
        <BannerCarousel
          images={[
            { src: criativos.bannerPrincipal, alt: "Arquibancada 12" },
            { src: criativos.bannerSecundario, alt: "Coleção torcida" },
          ]}
          className="w-full"
          aspectClassName="aspect-[21/7] md:aspect-[16/5]"
        />
        <div className="absolute bottom-10 left-0 right-0 z-10 text-center">
          <h1 className="font-fat text-5xl text-white drop-shadow-2xl md:text-9xl tracking-tighter uppercase leading-none">
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
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="group flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="block font-heading text-lg tracking-tight text-white uppercase">{label}</span>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-950 py-20">
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

      <section className="py-16 bg-black">
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
