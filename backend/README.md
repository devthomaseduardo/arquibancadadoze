# Torcida Urbana – Backend

API e estrutura backend da loja virtual **Torcida Urbana** (dropshipping de camisas de futebol).

## Stack

- **Node.js** + **TypeScript**
- **Express** – API REST
- **Prisma** + **PostgreSQL** – banco de dados (recomendado para produção/Vercel)
- **Zod** – validação
- **xlsx** – exportação Excel

## Estrutura

```
backend/
├── prisma/
│   ├── schema.prisma    # Modelos: Category, Product, Order, OrderItem, etc.
│   └── seed.ts          # Categorias, produtos, frete, FAQ, config
├── src/
│   ├── config/          # env, constantes
│   ├── shared/          # prisma client, errors, middlewares
│   ├── modules/
│   │   ├── categories/  # CRUD categorias (listagem pública)
│   │   ├── products/    # CRUD produtos (listagem pública)
│   │   ├── orders/      # Criar pedido + admin (listar, filtrar, detalhes, status, texto fornecedor)
│   │   ├── metrics/     # Dashboard (totais, por região, por pagamento)
│   │   ├── content/     # Frete, FAQ, config (sobre, contato, horário, política)
│   │   ├── returns/     # Trocas e devoluções
│   │   └── export/      # Exportar pedidos CSV/Excel
│   └── index.ts         # App Express e rotas
├── .env
├── package.json
└── tsconfig.json
```

## Como rodar

```bash
cd backend
npm install
cp .env.example .env   # se ainda não tiver .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API em `http://localhost:3000`.

## Endpoints principais

### Público (loja)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/categories` | Lista categorias |
| GET | `/api/categories/:slug` | Categoria por slug com produtos |
| GET | `/api/products` | Lista produtos (`?category=slug`) |
| GET | `/api/products/:slug` | Produto por slug |
| POST | `/api/orders` | Criar pedido (body validado) |
| GET | `/api/content/shipping` | Tabela de frete por região |
| GET | `/api/content/faq` | FAQ |
| GET | `/api/content/config?keys=about,contact_whatsapp,...` | Textos e contatos |
| POST | `/api/auth/register` | Cadastro (name, email, password) – retorna user + token |
| POST | `/api/auth/login` | Login (email, password) – retorna user + token |
| GET | `/api/auth/me` | Dados do usuário logado (header `Authorization: Bearer <token>`) |
| GET | `/api/orders/me/orders` | Meus pedidos (cliente logado) |
| GET | `/api/payments/mercadopago/public-key` | Chave pública MP (frontend) |
| POST | `/api/payments/mercadopago/preference` | Cria preferência MP (orderId, backUrls) – PIX/boleto |
| POST | `/api/payments/mercadopago/card` | Pagamento com cartão (orderId, token, paymentMethodId) |

### Admin (header `X-Admin-Key: <ADMIN_API_KEY>` ou query `?adminKey=...`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/orders` | Lista pedidos (filtros: dateFrom, dateTo, orderStatus, paymentStatus, customerName, orderNumber, orderId) |
| GET | `/api/orders/:id` | Detalhes do pedido |
| GET | `/api/orders/by-number/:orderNumber` | Pedido por número |
| PATCH | `/api/orders/:id` | Atualizar status, rastreio, notas |
| GET | `/api/orders/:id/supplier-text` | Texto formatado para enviar ao fornecedor (WhatsApp) |
| POST | `/api/orders/:id/communications` | Registrar comunicação (type, content) |
| GET | `/api/admin/metrics` | Métricas (totais, ticket médio, por região/pagamento). Opcional: `?dateFrom=&dateTo=` |
| GET | `/api/admin/export/orders` | Exportar pedidos CSV ou XLSX (`?format=xlsx&dateFrom=&dateTo=`) |
| GET/POST/PATCH | `/api/admin/returns` | Listar, criar e atualizar trocas/devoluções |
| GET/PUT | `/api/content/config/:key` | Ler/editar config (about, contact_whatsapp, etc.) |

## Variáveis de ambiente

- `PORT` – porta (padrão 3000)
- `DATABASE_URL` – conexão Prisma PostgreSQL
- `ADMIN_API_KEY` – chave para rotas admin (recomendado em produção)
- `JWT_SECRET` – segredo para assinar o token de login do cliente (use valor forte em produção)
- `MERCADOPAGO_ACCESS_TOKEN` – token de acesso do Mercado Pago (painel MP > Credenciais)
- `MERCADOPAGO_PUBLIC_KEY` – chave pública do MP (para tokenização de cartão no frontend)
- `FRONTEND_ORIGINS` – origens CORS separadas por vírgula (ex: `https://meu-frontend.vercel.app`)

**Mercado Pago:** No [painel do desenvolvedor](https://www.mercadopago.com.br/developers) em Sua integração > Credenciais, use o **Access Token** (produção ou teste) e a **Chave pública**. O Access Token costuma começar com `APP_USR-` ou `TEST-`.

## Seed

O seed cria:

- **13 categorias** com faixas de custo (R$ 50–400) e um produto exemplo por categoria
- **Tabela de frete**: Sudeste/Sul R$ 35; Nordeste/Norte/Centro-Oeste R$ 45
- **FAQ** (tamanhos, prazos, pagamento, troca, rastreio)
- **SiteConfig**: about, business_hours, return_policy, contact_whatsapp, contact_email, redes sociais

Ajuste WhatsApp e redes no seed ou via `PUT /api/content/config/:key` após deploy.

## Integração Nuvemshop

Para integrar com a Nuvemshop (estoque, pagamentos, checkout):

1. Crie um app na Nuvemshop e use webhooks de **pedido criado** (e opcionalmente **pagamento aprovado**).
2. Ao receber o webhook, chame `POST /api/orders` com o payload mapeado para o formato da API (customerName, items, address*, paymentMethod, etc.) e guarde `externalId` com o ID do pedido na Nuvemshop.
3. Pagamentos (cartão, boleto, PIX) continuam na Nuvemshop; este backend concentra gestão de pedidos, custos e lucro para o fluxo de dropshipping.

## Próximos passos

- Frontend da loja (vitrine + checkout) consumindo esta API
- Painel admin (React/Vue/etc.) com lista de pedidos, filtros, métricas e exportação
- Webhook handler Nuvemshop em `/api/webhooks/nuvemshop`
- Opção de gerar etiqueta de envio (integrar com API dos Correios ou transportadora)

## Deploy na Vercel

1. Configure o projeto com raiz `backend`.
2. Defina variáveis de ambiente obrigatórias (`DATABASE_URL`, `ADMIN_API_KEY`, `JWT_SECRET`, `FRONTEND_ORIGINS`).
3. Após deploy, rode no banco de produção:
   - `npx prisma db push`
   - `npm run db:seed`
