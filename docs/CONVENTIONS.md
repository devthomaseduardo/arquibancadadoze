# Convenções do projeto (Arquibancada 12)

Documento para desenvolvedores e assistentes de código: onde as coisas vivem e como estender.

---

## Estrutura de pastas de produtos (por fornecedor)

As imagens ficam em **`src/public/Produtos/`** (ou `public/Produtos/`), organizadas por fornecedor:

- **`Fornecedor 1/`** — Kit Infantil, Modelo Jogador, Tailandês Torcedor, Tailandês Retrô (subpastas)
- **`Fornecedor 2/`** — idem, quando houver

Exemplo: `Produtos/Fornecedor 1/Kit Infantil/Conjunto Infantil São Paulo 2024 - Camisa e Short.jpg`

O **nome do arquivo** é usado para exibir nome e time do produto (ex.: "Conjunto Infantil São Paulo 2024", time "São Paulo"). O cliente **não vê** de qual fornecedor é; no **painel admin** aparecem produto, fornecedor e custo.

---

## Estrutura rápida

| Camada | Onde | Responsabilidade |
|--------|------|------------------|
| **API (tipos)** | `src/lib/api.ts` | Tipos da API (ApiCategory, ApiProduct, ApiOrder...). Não misturar com tipos da loja. |
| **Loja (tipos)** | `src/types/index.ts` | Product, Category — tipos usados na UI. Alinhados a `StoreProduct` / `StoreCategory`. |
| **Mapeamento API → Loja** | `src/lib/store-mappers.ts` | toStoreCategory, toStoreProduct, getUploadedMediaForCategorySlug, getCategoryGalleryProducts. |
| **Mapeamentos de categoria** | `src/data/category-mappings.ts` | Slug da categoria → pasta de imagens, imagem editorial, galeria. **Único lugar para registrar nova categoria de imagens.** |
| **Paths de imagens** | `src/data/produtos-public-paths.ts` | Lista de arquivos por pasta em `src/public/Produtos/`. Atualizar ao adicionar pasta nova. |
| **Backend categorias** | `backend/src/shared/seed.ts` | Categorias e produtos no banco. Manter slugs iguais aos do front (category-mappings). |

---

## Como adicionar uma nova pasta de produtos (ex.: nova linha de camisas)

1. **Colocar as imagens** em `src/public/Produtos/` — pode ser por fornecedor, ex.: `Fornecedor 1/Kit Infantil/`. Nome dos arquivos: descritivos (ex.: `Conjunto Infantil São Paulo 2024 - Camisa e Short.jpg`) para o sistema extrair nome e time.
2. **Registrar os paths** em `src/data/produtos-public-paths.ts`: adicionar a chave da pasta (ex.: `"KIT INFANTIL 1.1"` ou `"Fornecedor 1/Kit Infantil"`) e o array de paths relativos a `Produtos/`.
3. **Vincular à categoria** em `src/data/category-mappings.ts`:
   - Em `categorySlugToProdutosFolder`: `"slug-da-categoria-backend": "NOME_DA_PASTA"` (ou `"Fornecedor 1/Kit Infantil"`).
   - Se a categoria tiver galeria (um card por imagem), adicionar o slug em `CATEGORY_GALLERY_SLUGS`.
4. **Backend**: garantir que existe categoria (e se quiser produto) no seed com o mesmo `slug`; produtos podem ter `supplierId` (Fornecedor 1/2) para o admin ver custo/fornecedor.

---

## Galeria por categoria (um card por imagem)

Categorias em `CATEGORY_GALLERY_SLUGS` (em `category-mappings.ts`) mostram um card por imagem da pasta, em vez de só os produtos da API. Nome e “time” do card vêm do nome do arquivo (ex.: “Kit Infantil Flamengo Listrado 2024…” → time “Flamengo”). Todas as imagens usam o mesmo produto da API (preço, slug, tamanhos).

---

## Filtro por página

- **`/produtos`** (todas): select “Todas categorias” + busca.
- **`/produtos?cat=slug`** (categoria específica): só busca (filtro daquela página). Select de categoria não aparece. Link “Ver todas as categorias” no topo.

---

## URLs de imagens de produtos

- Montagem da URL: `src/data/produtos-public-paths.ts` → `buildProdutoImageUrl(relativePath)` → `/Produtos/` + path com encode.
- Fallback por categoria: `getUploadedMediaForCategorySlug(categorySlug)` em `store-mappers.ts` (usa pasta ou `uploaded-media`).

## Atualizar lista de imagens (script)

Depois de adicionar ou mudar arquivos em `src/public/Produtos/` ou `public/Produtos/` (ex.: `Fornecedor 1/Kit Infantil/`), rode:

```bash
npm run update-produtos-paths
```

Isso regera `src/data/produtos-public-paths.ts` a partir das pastas. As chaves do objeto são os nomes das pastas relativas (ex.: `"Fornecedor 1/Kit Infantil"`). Se você passou a usar uma pasta nova, atualize `src/data/category-mappings.ts` em `categorySlugToProdutosFolder` para apontar a categoria para essa chave.

---

## Variáveis de ambiente

- **Frontend**: `.env` na raiz do front (Vite). `VITE_API_BASE_URL`, `VITE_ADMIN_API_KEY`.
- **Backend**: `backend/.env`. Ver `backend/.env.example`. Não versionar `.env`.
