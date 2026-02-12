import type { ApiCategory, ApiProduct, ApiProductDetail } from "@/lib/api";
import { uploadedProdutosByCategoria } from "@/data/uploaded-media";
import { catalogoProdutos } from "@/data/produto-catalogo";

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceRange: string;
  image: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  priceMin: number;
  priceMax: number;
  image: string;
  team: string;
  sizes: string[];
  description: string;
  badge?: string;
};

const PLACEHOLDER_IMAGE = "/placeholder.svg";

const categorySlugToMediaKey: Record<string, keyof typeof uploadedProdutosByCategoria> = {
  "camisas-tailandesas-torcedor": "tailandesa-1-1-torcedor",
  "tailandesa-torcedor-g1": "tailandesa-1-1-torcedor",
  "tailandesa-torcedor-g4": "tailandesa-1-1-torcedor",
  "conjuntos-infantis-tailandeses": "kit-infantil-1-1",
  "retro-tailandesas": "tailandesa-retro",
  "camisas-nacionais-premium": "nacional-premium",
  "bones-premium": "bones",
  "modelos-jogador-tailandeses": "modelo-jogador-1-1",
};

function isDisplayableImage(path: string): boolean {
  return /\.(png|jpe?g|webp|svg)$/i.test(path);
}

function fallbackImageForCategorySlug(categorySlug: string): string | null {
  const mediaList = getUploadedMediaForCategorySlug(categorySlug);
  return mediaList[0] ?? null;
}

export function getUploadedMediaForCategorySlug(categorySlug: string): string[] {
  const mediaKey = categorySlugToMediaKey[categorySlug];
  if (!mediaKey) return [];
  const mediaList = uploadedProdutosByCategoria[mediaKey] ?? [];
  return mediaList.filter(isDisplayableImage);
}

const teamByPath = new Map(catalogoProdutos.map((item) => [item.path, item.clube]));

export function getTeamByMediaPath(path: string): string {
  return teamByPath.get(path) ?? "Não identificado";
}

export function parseSizes(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function toStoreCategory(category: ApiCategory): StoreCategory {
  const fallbackImage = fallbackImageForCategorySlug(category.slug);
  const prices = (category.products ?? []).flatMap((p) => [p.priceMin, p.priceMax]).filter((v) => Number.isFinite(v));
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    priceRange:
      minPrice != null && maxPrice != null
        ? `R$ ${Math.round(minPrice)} – R$ ${Math.round(maxPrice)}`
        : "Consulte os valores",
    image: category.imageUrl || fallbackImage || PLACEHOLDER_IMAGE,
  };
}

export function toStoreProduct(product: ApiProduct): StoreProduct {
  const fallbackImage = fallbackImageForCategorySlug(product.category.slug);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    priceMin: product.priceMin,
    priceMax: product.priceMax,
    image: product.imageUrl || fallbackImage || PLACEHOLDER_IMAGE,
    team: "Não identificado",
    sizes: parseSizes(product.sizes),
    description: product.description ?? "",
  };
}

export function toStoreProductDetail(product: ApiProductDetail): StoreProduct {
  const fallbackImage = fallbackImageForCategorySlug(product.category.slug);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    priceMin: product.priceMin,
    priceMax: product.priceMax,
    image: product.imageUrl || fallbackImage || PLACEHOLDER_IMAGE,
    team: "Não identificado",
    sizes: parseSizes(product.sizes),
    description: product.description ?? "",
  };
}

export function parseConfigValue<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
