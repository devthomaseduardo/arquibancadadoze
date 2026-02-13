import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";
import { getCatalogInfoByMediaPath, getTeamByMediaPath, getUploadedMediaForCategorySlug, toStoreCategory, toStoreProduct } from "@/lib/store-mappers";
import { criativos } from "@/data/criativos";
import BannerCarousel from "@/components/BannerCarousel";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCat = searchParams.get("cat") || "todos";
  const [search, setSearch] = useState("");

  const { data: rawCategories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: rawProducts = [], isLoading, isError } = useQuery({
    queryKey: ["products", selectedCat],
    queryFn: () => getProducts(selectedCat !== "todos" ? selectedCat : undefined),
  });

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
      name: getCatalogInfoByMediaPath(image)?.titulo || baseProduct.name,
      categoryName: getCatalogInfoByMediaPath(image)?.categoria || baseProduct.categoryName,
    }));
  });

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q),
    );
  }, [products, search]);

  const currentCategory = categories.find((c) => c.slug === selectedCat);
  const groupedByTeam = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, item) => {
      const key = item.team || "Outros";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered]);
  const teamOrder = Object.keys(groupedByTeam).sort((a, b) => {
    if (a === "Não identificado") return 1;
    if (b === "Não identificado") return -1;
    return a.localeCompare(b, "pt-BR");
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 overflow-hidden rounded-2xl border border-border">
          <BannerCarousel
            images={[
              { src: criativos.bannerCamisas, alt: "Catálogo de camisas" },
              { src: criativos.bannerPrincipal, alt: "Ofertas da torcida" },
            ]}
            className="rounded-2xl border border-border"
          />
        </div>

        <h1 className="font-heading text-4xl text-foreground">
          {currentCategory ? currentCategory.name : "TODOS OS PRODUTOS"}
        </h1>
        {currentCategory && <p className="mt-2 text-sm text-muted-foreground">{currentCategory.description}</p>}

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="Buscar por categoria ou produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSearchParams({})}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                selectedCat === "todos"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
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
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando produtos...</p>}
        {isError && <p className="mt-8 text-sm text-destructive">Não foi possível carregar os produtos.</p>}

        {!isLoading && !isError && (
          <>
            <div className="mt-8 space-y-10">
              {teamOrder.map((team) => (
                <section key={team}>
                  <h2 className="mb-4 font-heading text-2xl text-foreground">
                    {team === "Não identificado" ? "OUTROS MODELOS" : `TIME: ${team.toUpperCase()}`}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {groupedByTeam[team].map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-border">
              <BannerCarousel
                images={[
                  { src: criativos.bannerNome, alt: "Camisas personalizadas com nome" },
                  { src: criativos.bannerSecundario, alt: "Coleção oficial da torcida" },
                ]}
                className="rounded-2xl border border-border"
              />
            </div>

            {filtered.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">Nenhum produto encontrado.</div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Products;
