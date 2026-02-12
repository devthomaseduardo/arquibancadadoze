# Como o backend se comporta na prática

Este texto explica o que o backend faz **do lado do cliente** (quem compra na loja) e **do seu lado** (dono da loja / admin), como se fosse o dia a dia real.

---

## O que o backend é (em uma frase)

O backend é **só a API**: não tem telas, não tem site. Um **frontend** (site da loja + painel admin) chama essas URLs e o backend devolve ou grava dados no banco. O “comportamento real” depende de você ter um frontend que use essa API (ou testar pelo Postman).

---

## Lado do CLIENTE (quem compra na loja)

O cliente usa o **site da loja** (que você ainda vai criar ou integrar com Nuvemshop). Esse site é que fala com o backend. Na prática, acontece o seguinte:

### 1. Entrando na loja e navegando

- O site chama **GET /api/categories** → o backend devolve a lista de categorias (Camisas Tailandesas, Retrô, Bonés, etc.).
- O cliente clica numa categoria → o site chama **GET /api/categories/camisas-tailandesas-torcedor** (ou **GET /api/products?category=...**) → o backend devolve os produtos daquela categoria, com nome, preço, tamanhos, foto.
- Ao abrir um produto → **GET /api/products/camisas-tailandesas-torcedor-principal** → o backend devolve detalhes (descrição, tamanhos P/M/G/GG, preço mínimo/máximo).

**Comportamento real:** o cliente só vê o que o frontend mostrar. O backend só garante que esses dados existem e estão atualizados no banco.

### 2. Dúvidas antes de comprar

- **Frete:** o site chama **GET /api/content/shipping** → o backend devolve a tabela (ex.: Sudeste R$ 35, Norte R$ 45). O site usa isso para mostrar “Frete para SP: R$ 35”.
- **Perguntas frequentes:** **GET /api/content/faq** → o backend devolve as perguntas e respostas (tamanho, prazo, troca, etc.).
- **Quem somos / Contato / Horário:** **GET /api/content/config?keys=about,contact_whatsapp,business_hours** → o backend devolve os textos e links (WhatsApp, Instagram, “Pedidos das 10h às 17h”).

**Comportamento real:** o cliente lê essas informações nas páginas que o frontend montar com esses dados.

### 3. Finalizando a compra (checkout)

O cliente preenche carrinho, endereço e escolhe pagamento. O **frontend** (ou a Nuvemshop, se integrar) envia um **POST /api/orders** com algo assim:

- Nome, e-mail, telefone
- Endereço completo (rua, número, cidade, estado, CEP)
- Forma de pagamento (cartão, boleto, Pix)
- Lista de itens: nome do produto, tamanho (variação), quantidade, preço pago por unidade
- Frete cobrado (ex.: R$ 35)

O backend:

1. **Valida** os dados (e-mail válido, itens preenchidos, etc.). Se algo estiver errado, devolve erro e o frontend mostra a mensagem.
2. **Gera um número de pedido** (1001, 1002, 1003…).
3. **Calcula** subtotal, total da venda, e (se você enviar `unitCost` e `shippingCostPaid`) o custo e o **lucro estimado**.
4. **Salva** o pedido e os itens no banco.
5. **Responde** com o pedido criado (incluindo `id` e `orderNumber`).

**Comportamento real:** do ponto de vista do cliente, ele “finalizou a compra”: viu uma tela de confirmação e (se o frontend quiser) recebeu e-mail/SMS. Na prática quem dispara e-mail é o frontend ou a Nuvemshop; o backend só guarda o pedido.

### 4. Depois da compra (rastreio, troca)

- **Rastreio:** o backend **não envia** e-mail sozinho. Você (admin) atualiza o código de rastreio no pedido; o frontend ou outro sistema pode buscar **GET /api/orders/:id** (com chave de admin) e usar esse dado para enviar e-mail/SMS ao cliente.
- **Troca/devolução:** a política está em **config** (return_policy). O cliente pede troca pelo seu canal (WhatsApp, e-mail). Você registra isso no admin (trocas/devoluções). O backend guarda o registro; quem avisa o cliente é você ou um painel que você fizer.

**Resumo cliente:** o cliente só “conversa” com o backend indiretamente, através do site da loja (ou da Nuvemshop). O backend é quem guarda catálogo, conteúdo (frete, FAQ, contato) e pedidos.

---

## Lado do USUÁRIO / ADMIN (você, dono da loja)

Você usa um **painel administrativo** (que você vai criar ou já testa pelo Postman). Todas as rotas de admin exigem a **chave** (`X-Admin-Key`). Na prática, seu dia a dia é assim:

### 1. Chegou um pedido novo

- O pedido foi criado pelo site (POST /api/orders) ou virá da Nuvemshop (webhook que você configurar).
- Você abre o painel e chama **GET /api/orders** (com a chave admin). O backend devolve a **lista de pedidos** em tabela: número, data, cliente, produtos, totais, status de pagamento, status do pedido, lucro estimado.
- Você pode **filtrar**: por data (`dateFrom`, `dateTo`), por status (`orderStatus=aguardando`), por nome do cliente, por número do pedido. Tudo isso o backend já suporta na mesma URL.

**Comportamento real:** você vê só os pedidos que ainda precisa separar/enviar, ou todos, conforme os filtros.

### 2. Detalhes do pedido e separação

- Você clica em um pedido → o painel chama **GET /api/orders/:id**. O backend devolve **tudo**: dados do cliente (nome, telefone, e-mail, endereço completo), itens (produto, tamanho, quantidade, preço, custo), frete, totais, histórico de comunicações, trocas (se houver).
- Você usa isso para:
  - **Separar o pedido** no seu estoque ou repassar ao fornecedor.
  - **Falar com o cliente** (telefone/e-mail na tela).
  - **Registrar uma comunicação**: **POST /api/orders/:id/communications** com `type` e `content` (ex.: “Cliente ligou pedindo antecipar envio”). Fica salvo no histórico do pedido.

**Comportamento real:** você tem uma “ficha” completa do pedido na tela e um histórico do que já foi feito/falado.

### 3. Enviar para o fornecedor (dropshipping)

- No pedido você clica em “Copiar para enviar ao fornecedor” (ou “Enviar por WhatsApp”). O painel chama **GET /api/orders/:id/supplier-text**.
- O backend monta um **texto formatado** com: número do pedido, nome e telefone do cliente, endereço de entrega e lista de itens (produto, tamanho, quantidade). Esse texto é feito para colar no WhatsApp (ou outro canal) do fornecedor.

**Comportamento real:** você cola o texto, envia ao fornecedor e ele envia direto para o endereço do cliente. Nada é enviado automaticamente; o backend só gera o texto.

### 4. Atualizar status e rastreio

- Quando o fornecedor (ou você) enviar o pacote, você recebe o **código de rastreio**. No painel você abre o pedido e atualiza: **PATCH /api/orders/:id** com por exemplo:
  - `orderStatus: "enviado"`
  - `trackingCode: "BR123456789BR"`
  - `trackingUrl: "https://..."` (opcional)
- O backend salva. O frontend pode usar isso para enviar e-mail/SMS ao cliente com o link de rastreio (isso seria implementado no frontend ou em outro serviço).

**Comportamento real:** o pedido passa a aparecer como “Enviado” e o cliente pode ser avisado pelo seu canal (e-mail/SMS que você ou a Nuvemshop disparar).

### 5. Pagamento e entrega

- Quando o gateway (Nuvemshop, etc.) confirmar o pagamento, você ou um webhook pode dar **PATCH /api/orders/:id** com `paymentStatus: "aprovado"`.
- Quando a transportadora marcar entrega, você pode atualizar com `orderStatus: "entregue"`. O backend só guarda; quem avisa o cliente é o seu processo.

### 6. Trocas e devoluções

- Cliente pede troca (defeito ou tamanho errado, em até 7 dias). Você registra: **POST /api/admin/returns** com `orderId`, `reason` (defeito_fabricacao, tamanho_errado, outro), `description` (opcional).
- O backend cria o registro de troca/devolução e você acompanha: **GET /api/admin/returns** (lista) e **PATCH /api/admin/returns/:id** para mudar o status (solicitado → aprovado → em_transito → concluido). Se marcar “concluído”, o backend pode atualizar o pedido para `orderStatus: "trocado_devolvido"`.

**Comportamento real:** você tem uma lista de trocas e o status de cada uma, alinhado à sua política (7 dias, defeito/tamanho).

### 7. Números da loja (métricas)

- No painel você abre “Dashboard” ou “Métricas”. O frontend chama **GET /api/admin/metrics** (e opcionalmente `?dateFrom=...&dateTo=...`).
- O backend devolve: **total de pedidos**, **valor total vendido**, **custo total**, **lucro total**, **ticket médio**, e quebras por **região**, **forma de pagamento** e **status do pedido**.

**Comportamento real:** você vê se está lucrando, de onde vêm mais pedidos e como as pessoas pagam.

### 8. Relatórios e planilhas

- Você quer uma planilha para contabilidade ou para enviar ao contador. No painel você escolhe período e clica em “Exportar”. O frontend chama **GET /api/admin/export/orders?format=xlsx&dateFrom=...&dateTo=...** (ou `format=csv`).
- O backend monta uma planilha com: número do pedido, data, cliente, endereço, produtos, subtotal, frete cobrado/pago, total da venda, custo, **lucro estimado**, forma de pagamento, status, código de rastreio, etc., e devolve o arquivo para download.

**Comportamento real:** você baixa um CSV ou Excel com todos os pedidos do período e as margens de lucro.

---

## Visão geral do fluxo de dados

```
[Cliente]  →  Site da loja (frontend)  →  POST /api/orders  →  Backend grava pedido
                                                                      ↓
[Você]     →  Painel admin (frontend)  →  GET /api/orders   ←  Backend devolve lista
            →  GET /api/orders/:id     ←  Detalhes
            →  PATCH /api/orders/:id   →  Atualiza status/rastreio
            →  GET .../supplier-text   ←  Texto para fornecedor
            →  GET /api/admin/metrics  ←  Números da loja
            →  GET .../export/orders   ←  Planilha
```

- **Cliente:** não “vê” o backend; vê o site. O backend é quem guarda o que ele comprou e os dados que o site mostra (catálogo, frete, FAQ).
- **Você (admin):** usa o painel que chama a API com a chave; o backend devolve e atualiza pedidos, gera texto para fornecedor, métricas e exportação. Nada é enviado sozinho (e-mail, WhatsApp); isso depende do frontend ou de integrações que você fizer.

Isso é exatamente como o backend se comporta na prática do lado do usuário e do cliente.
