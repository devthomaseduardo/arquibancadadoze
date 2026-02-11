import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/categories";
import { products } from "@/data/products";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCat = searchParams.get("cat") || "todos";
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCat !== "todos") {
      result = result.filter((p) => p.categorySlug === selectedCat);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedCat, search]);

  const currentCategory = categories.find((c) => c.slug === selectedCat);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-4xl text-foreground">
          {currentCategory ? currentCategory.name : "TODOS OS PRODUTOS"}
        </h1>
        {currentCategory && (
          <p className="mt-2 text-sm text-muted-foreground">{currentCategory.description}</p>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="Buscar por time ou produto..."
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

        {/* Products Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
