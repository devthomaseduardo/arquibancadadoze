
import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import { getCategories, getProducts } from "../lib/api";
import { toStoreCategory, toStoreProduct, getCategoryGalleryProducts } from "../lib/store-mappers";
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCat = searchParams.get("cat") || "todos";
  const buscaFromUrl = searchParams.get("busca") || "";
  const [search, setSearch] = useState(() => searchParams.get("busca") || "");
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

  useEffect(() => {
    if (buscaFromUrl) setSearch(buscaFromUrl);
  }, [buscaFromUrl]);

  const { data: rawCategories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: rawProducts = [], isLoading, isError } = useQuery({
    queryKey: ["products", selectedCat],
    queryFn: () => getProducts(selectedCat !== "todos" ? selectedCat : undefined),
  });

  const categories = rawCategories.map(toStoreCategory);
  const apiProducts = rawProducts.map(toStoreProduct);
  const currentCategory = categories.find((c) => c.slug === selectedCat);

  const products = useMemo(() => {
    const gallery = getCategoryGalleryProducts(
      selectedCat,
      currentCategory?.name ?? "",
      apiProducts[0] ?? null,
    );
    if (gallery.length) return gallery;
    return apiProducts;
  }, [selectedCat, currentCategory?.name, apiProducts]);

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

  const isCategoryPage = selectedCat !== "todos";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2">
          {isCategoryPage && (
            <Link
              to="/produtos"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors w-fit"
            >
              <ChevronLeft className="h-4 w-4" /> Ver todas as categorias
            </Link>
          )}
          <h1 className="font-heading text-3xl md:text-5xl text-white font-bold tracking-tight">
            {currentCategory ? currentCategory.name : "Todos os produtos"}
          </h1>
          {currentCategory && <p className="mt-2 text-sm text-zinc-400 max-w-2xl">{currentCategory.description}</p>}
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder={isCategoryPage ? "Buscar nesta categoria (time ou nome)..." : "Buscar produto ou time..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {search !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>
          {!isCategoryPage && (
            <div className="relative">
              <select
                value={selectedCat}
                onChange={(e) => setSearchParams(e.target.value === "todos" ? {} : { cat: e.target.value })}
                className="appearance-none rounded-xl border border-white/10 bg-zinc-900/80 px-5 py-3 pr-10 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
              >
                <option value="todos">Todas categorias</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          )}
        </div>

        {isLoading && (
          <div className="mt-20 flex flex-col items-center justify-center text-zinc-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-sm font-medium animate-pulse">Carregando produtos da arquibancada...</p>
          </div>
        )}
        
        {isError && <p className="mt-8 text-sm text-red-500">Não foi possível carregar os produtos.</p>}

        {!isLoading && !isError && (
          <div className="mt-10 grid grid-cols-2 gap-5 md:gap-6 md:grid-cols-3 lg:grid-cols-4">
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
