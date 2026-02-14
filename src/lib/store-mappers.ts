import type { ApiCategory, ApiProduct, ApiProductDetail } from "@/lib/api";
import { uploadedProdutosByCategoria } from "@/data/uploaded-media";
import { produtosPublicPathsByFolder, buildProdutoImageUrl } from "@/data/produtos-public-paths";
import {
  categorySlugToEditorialImage,
  categorySlugToProdutosFolder,
  categorySlugToMediaKey,
  CATEGORY_GALLERY_SLUGS,
  type CategoryGallerySlug,
} from "@/data/category-mappings";
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

const DISPLAYABLE_IMAGE_REGEX = /\.(png|jpe?g|webp|svg)$/i;
const DISPLAYABLE_GALLERY_REGEX = /\.(png|jpe?g|webp)$/i;

function isDisplayableImage(path: string): boolean {
  return DISPLAYABLE_IMAGE_REGEX.test(path);
}

function fallbackImageForCategorySlug(categorySlug: string): string | null {
  const mediaList = getUploadedMediaForCategorySlug(categorySlug);
  return mediaList[0] ?? null;
}

/** Retorna URLs de imagens da pasta src/public/Produtos para a categoria (prioridade) ou fallback do uploaded-media */
export function getUploadedMediaForCategorySlug(categorySlug: string): string[] {
  const folderName = categorySlugToProdutosFolder[categorySlug];
  if (folderName && produtosPublicPathsByFolder[folderName]?.length) {
    return produtosPublicPathsByFolder[folderName].map(buildProdutoImageUrl);
  }
  const mediaKey = categorySlugToMediaKey[categorySlug];
  if (!mediaKey) return [];
  const mediaList = uploadedProdutosByCategoria[mediaKey] ?? [];
  return mediaList.filter(isDisplayableImage);
}

/** Nomes de times conhecidos (dois ou mais termos) para extrair do nome do arquivo — ordem: mais longo primeiro */
const TEAM_NAMES_MULTI = [
  "Manchester United", "Real Madrid", "Atletico de Madrid", "Atlético de Madrid",
  "Sao Paulo", "São Paulo", "Sport Recife", "Internacional", "Atlético-MG", "Atletico-MG",
  "Athletico-PR", "Red Bull Bragantino", "Vasco da Gama",
];
/** Um único termo (clube) */
const TEAM_NAMES_SINGLE = [
  "Flamengo", "Corinthians", "Palmeiras", "Santos", "Grêmio", "Gremio", "Bahia", "Fortaleza",
  "Botafogo", "Fluminense", "Cruzeiro", "Brasil", "Portugal", "Barcelona", "Juventus",
];

function extractTeamFromProductName(teamPart: string): string {
  const normalized = teamPart.normalize("NFD").replace(/\u0300-\u036f/g, "");
  for (const t of TEAM_NAMES_MULTI) {
    const tn = t.normalize("NFD").replace(/\u0300-\u036f/g, "");
    if (normalized.includes(tn) || teamPart.includes(t)) return t;
  }
  const words = teamPart.split(/\s+/);
  for (const w of words) {
    const wn = w.normalize("NFD").replace(/\u0300-\u036f/g, "");
    for (const s of TEAM_NAMES_SINGLE) {
      const sn = s.normalize("NFD").replace(/\u0300-\u036f/g, "");
      if (wn === sn || w === s) return s;
    }
  }
  return words[0] || teamPart || "Kit Infantil";
}

/** Extrai nome e time a partir do path/nome do arquivo (ex: "Kit Infantil Flamengo Listrado 2024", "Conjunto Infantil São Paulo...") */
function parseKitInfantilLabel(relativePath: string): { name: string; team: string } {
  const filename = relativePath.split("/").pop() ?? "";
  let text = filename
    .replace(/^→\s*/, "")
    .replace(/\s*-\s*Camisa e Short Torcedor\.(jpe?g|heic|heif)$/i, "")
    .replace(/\s*-\s*Camisa e Short\.(jpe?g|heic|heif)$/i, "")
    .replace(/\.(jpe?g|png|webp|heic|heif)$/i, "")
    .trim();
  const matchKit = text.match(/(?:Kit|Conjunto) Infantil (.+?) (\d{4})/i);
  if (matchKit) {
    const teamPart = matchKit[1].trim();
    const team = extractTeamFromProductName(teamPart);
    const name = text || "Conjunto Infantil";
    return { name, team };
  }
  const matchGeneric = text.match(/^(.+?)\s+(\d{4})/);
  if (matchGeneric) {
    const rest = matchGeneric[1].trim();
    const team = extractTeamFromProductName(rest) !== rest ? extractTeamFromProductName(rest) : rest.split(/\s+/)[0] || rest;
    return { name: text || "Produto", team };
  }
  const firstWord = text.split(/\s+/)[0] || text;
  return { name: text || "Produto", team: firstWord || "—" };
}

/** Retorna produtos de galeria para a categoria (um StoreProduct por imagem da pasta). baseProduct vem da API (slug, preço, etc.). */
export function getCategoryGalleryProducts(
  categorySlug: string,
  categoryName: string,
  baseProduct: StoreProduct | null,
): StoreProduct[] {
  if (!CATEGORY_GALLERY_SLUGS.includes(categorySlug as CategoryGallerySlug)) return [];
  const folderName = categorySlugToProdutosFolder[categorySlug];
  if (!folderName || !produtosPublicPathsByFolder[folderName]?.length) return [];
  const paths = produtosPublicPathsByFolder[folderName];
  const displayablePaths = paths.filter((p) => DISPLAYABLE_GALLERY_REGEX.test(p));
  const priceMin = baseProduct?.priceMin ?? 0;
  const priceMax = baseProduct?.priceMax ?? 0;
  const slug = baseProduct?.slug ?? categorySlug + "-modelo-01";
  const sizes = baseProduct?.sizes ?? [];
  const description = baseProduct?.description ?? "";
  return displayablePaths.map((relativePath, i) => {
    const imageUrl = buildProdutoImageUrl(relativePath);
    const { name, team } = parseKitInfantilLabel(relativePath);
    return {
      id: `gallery-${categorySlug}-${i}`,
      slug,
      name,
      categorySlug,
      categoryName,
      priceMin,
      priceMax,
      image: imageUrl,
      team,
      sizes: [...sizes],
      description,
    };
  });
}

const catalogByPath = new Map(catalogoProdutos.map((item) => [item.path, item]));

export function getTeamByMediaPath(path: string): string {
  return catalogByPath.get(path)?.clube ?? "Não identificado";
}

export function getCatalogInfoByMediaPath(path: string) {
  return catalogByPath.get(path);
}

export function parseSizes(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return raw
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function toStoreCategory(category: ApiCategory): StoreCategory {
  const fallbackImage = fallbackImageForCategorySlug(category.slug);
  const editorial = categorySlugToEditorialImage[category.slug];
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
    image: category.imageUrl || editorial || fallbackImage || PLACEHOLDER_IMAGE,
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
