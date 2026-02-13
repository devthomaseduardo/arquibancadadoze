# Arquibancada 12 - Frontend

Loja React + Vite com vitrine, carrinho/checkout e painel administrativo.

## Rodar local

```bash
npm install
cp .env.example .env
npm run dev
```

## Variáveis de ambiente

- `VITE_API_BASE_URL` URL do backend (`http://localhost:3000` em dev ou URL Vercel em produção)
- `VITE_ADMIN_API_KEY` chave para chamadas admin

## Checkout demo Mercado Pago (dev)

Na página de checkout (`/checkout`) existe um bloco **Teste de integração (dev)** com botão
`COMPRA DEMO (MERCADO PAGO)`.

Esse botão chama `POST /api/payments/mercadopago/demo`, cria um pedido demo no backend
e abre o checkout do Mercado Pago em outra aba.

## Deploy na Vercel

- Projeto raiz: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrite já configurado em `vercel.json`
