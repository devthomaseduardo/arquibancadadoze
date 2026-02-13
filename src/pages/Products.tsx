
import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import { getCategories, getProducts } from "../lib/api";
import { toStoreCategory, toStoreProduct } from "../lib/store-mappers";
import { criativos } from "../data/criativos";
import BannerCarousel from "../components/BannerCarousel";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCat = searchParams.get("cat") || "todos";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Efeito para gerenciar o debounce da busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const { data: rawCategories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: rawProducts = [], isLoading, isError } = useQuery({
    queryKey: ["products", selectedCat],
    queryFn: () => getProducts(selectedCat !== "todos" ? selectedCat : undefined),
  });

  const categories = rawCategories.map(toStoreCategory);
  const products = rawProducts.map(toStoreProduct);

  const filtered = useMemo(() => {
    let list = products;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, debouncedSearch]);

  const currentCategory = categories.find((c) => c.slug === selectedCat);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-800">
          <BannerCarousel
            images={[
              { src: criativos.bannerCamisas, alt: "Catálogo de camisas" },
              { src: criativos.bannerPrincipal, alt: "Ofertas da torcida" },
            ]}
            className="rounded-2xl"
          />
        </div>

        <h1 className="font-heading text-4xl text-white">
          {currentCategory ? currentCategory.name : "TODOS OS PRODUTOS"}
        </h1>
        {currentCategory && <p className="mt-2 text-sm text-zinc-400">{currentCategory.description}</p>}

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Buscar produto ou time..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            {search !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSearchParams({})}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                selectedCat === "todos"
                  ? "bg-primary text-white"
                  : "border border-zinc-800 text-zinc-400 hover:border-primary hover:text-primary"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSearchParams({ cat: cat.slug })}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  selectedCat === cat.slug
                    ? "bg-primary text-white"
                    : "border border-zinc-800 text-zinc-400 hover:border-primary hover:text-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="mt-20 flex flex-col items-center justify-center text-zinc-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-sm font-medium animate-pulse">Carregando produtos da arquibancada...</p>
          </div>
        )}
        
        {isError && <p className="mt-8 text-sm text-red-500">Não foi possível carregar os produtos.</p>}

        {!isLoading && !isError && (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="py-20 text-center text-zinc-500">
            <p className="text-lg">Nenhum produto encontrado para sua busca.</p>
            <button 
              onClick={() => setSearch("")} 
              className="mt-4 text-primary hover:underline text-sm font-bold uppercase"
            >
              Limpar busca
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
