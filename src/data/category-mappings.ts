/**
 * Mapeamentos categoria (slug backend) ↔ imagens e galeria.
 * Ao adicionar nova categoria com pasta de imagens, edite aqui e em produtos-public-paths.ts.
 */
import { uploadedProdutosByCategoria } from "@/data/uploaded-media";

/** Imagem editorial por categoria (SVG/asset estático) */
export const categorySlugToEditorialImage: Record<string, string> = {
  "camisas-tailandesas-torcedor": "/categorias-editorial/torcida-premium.svg",
  "tailandesa-torcedor-g4": "/categorias-editorial/torcida-elite.svg",
  "conjuntos-infantis-tailandeses": "/categorias-editorial/arquibancada-kids.svg",
  "retro-tailandesas": "/categorias-editorial/classicos-do-futebol.svg",
  "camisas-nacionais-premium": "/categorias-editorial/manto-nacional.svg",
  "bones-premium": "/categorias-editorial/extras-de-estadio.svg",
};

/** Slug da categoria (backend) → nome da pasta em src/public/Produtos */
export const categorySlugToProdutosFolder: Record<string, string> = {
  "camisas-tailandesas-torcedor": "TAILANDESA 1.1 TORCEDOR",
  "tailandesa-torcedor-g1": "TAILANDESA 1.1 TORCEDOR",
  "tailandesa-torcedor-g4": "TAILANDESA 1.1 TORCEDOR",
  "mangas-longas-tailandesas": "TAILANDESA 1.1 TORCEDOR",
  "corta-vento-tailandeses": "TAILANDESA 1.1 TORCEDOR",
  "retro-tailandesas": "TAILANDESA RETRÔ",
  "camisas-nacionais-premium": "BRASILEIRÃO 🇧🇷",
  "camisetas-estampa-dtf": "BRASILEIRÃO 🇧🇷",
  "conjuntos-infantis-tailandeses": "KIT INFANTIL 1.1",
  "bones-premium": "TAILANDESA 1.1 TORCEDOR",
  "modelos-jogador-tailandeses": "TAILANDESA 1.1 TORCEDOR",
  "conjuntos-agasalho-tailandeses": "TAILANDESA 1.1 TORCEDOR",
  "kits-treino-tailandeses": "TAILANDESA 1.1 TORCEDOR",
};

type MediaKey = keyof typeof uploadedProdutosByCategoria;

/** Slug da categoria → chave em uploaded-media (fallback quando não há pasta em Produtos) */
export const categorySlugToMediaKey: Record<string, MediaKey> = {
  "camisas-tailandesas-torcedor": "tailandesa-1-1-torcedor",
  "tailandesa-torcedor-g1": "tailandesa-1-1-torcedor",
  "tailandesa-torcedor-g4": "tailandesa-1-1-torcedor",
  "conjuntos-infantis-tailandeses": "kit-infantil-1-1",
  "retro-tailandesas": "tailandesa-retro",
  "camisas-nacionais-premium": "nacional-premium",
  "camisetas-estampa-dtf": "nacional-premium",
  "bones-premium": "bones",
  "modelos-jogador-tailandeses": "modelo-jogador-1-1",
  "conjuntos-agasalho-tailandeses": "modelo-jogador-1-1",
  "mangas-longas-tailandesas": "tailandesa-1-1-torcedor",
  "kits-treino-tailandeses": "kit-infantil-1-1",
  "corta-vento-tailandeses": "tailandesa-1-1-torcedor",
};

/** Categorias que exibem galeria (um card por imagem da pasta) em vez de só produtos da API */
export const CATEGORY_GALLERY_SLUGS = ["conjuntos-infantis-tailandeses"] as const;

export type CategoryGallerySlug = (typeof CATEGORY_GALLERY_SLUGS)[number];
