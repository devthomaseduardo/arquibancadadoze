import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_USER = {
  email: "painel@torcidaurbana.com.br",
  password: "painel123",
  name: "Administrador Torcida Urbana",
};

/** Primeira imagem de cada categoria - paths em src/public/Produtos (frontend) */
const CATEGORY_IMAGE_URL: Record<string, string> = {
  "camisas-tailandesas-torcedor": "/Produtos/TAILANDESA%201.1%20TORCEDOR/masculino/IMG_3565.jpg",
  "tailandesa-torcedor-g1": "/Produtos/TAILANDESA%201.1%20TORCEDOR/masculino/IMG_0823.jpg",
  "tailandesa-torcedor-g4": "/Produtos/TAILANDESA%201.1%20TORCEDOR/feminino/IMG_9382.jpg",
  "conjuntos-infantis-tailandeses": "/Produtos/TAILANDESA%201.1%20TORCEDOR/feminino/IMG_1675.jpg",
  "retro-tailandesas": "/Produtos/TAILANDESA%20RETR%C3%94/IMG_3785.jpg",
  "camisas-nacionais-premium": "/Produtos/BRASILEIR%C3%83O%20%F0%9F%87%A7%F0%9F%87%B7/Flamengo%20%E2%9A%AB%F0%9F%94%94/01-%202025.jpg",
  "camisetas-estampa-dtf": "/Produtos/BRASILEIR%C3%83O%20%F0%9F%87%A7%F0%9F%87%B7/Corinthians%20%F0%9F%A6%85/2024.jpg",
  "bones-premium": "/Produtos/TAILANDESA%201.1%20TORCEDOR/masculino/IMG_5061.jpg",
  "modelos-jogador-tailandeses": "/Produtos/TAILANDESA%201.1%20TORCEDOR/masculino/IMG_7266.jpg",
  "conjuntos-agasalho-tailandeses": "/Produtos/TAILANDESA%201.1%20TORCEDOR/masculino/IMG_5640.jpg",
  "mangas-longas-tailandesas": "/Produtos/TAILANDESA%201.1%20TORCEDOR/masculino/IMG_1116.jpg",
  "kits-treino-tailandeses": "/Produtos/TAILANDESA%201.1%20TORCEDOR/feminino/IMG_1344.jpg",
  "corta-vento-tailandeses": "/Produtos/TAILANDESA%201.1%20TORCEDOR/masculino/IMG_2997.jpg",
};

const CATEGORIES = [
  {
    name: "Camisas Tailandesas Torcedor",
    slug: "camisas-tailandesas-torcedor",
    description: "Camisas tailandesas torcedor de times nacionais e internacionais. Qualidade e preço que a torcida merece.",
    costMin: 80,
    costMax: 80,
    sortOrder: 1,
  },
  {
    name: "Tailandesa Torcedor G1",
    slug: "tailandesa-torcedor-g1",
    description: "Linha G1 de camisas tailandesas torcedor. Tecido leve e confortável.",
    costMin: 90,
    costMax: 90,
    sortOrder: 2,
  },
  {
    name: "Tailandesa Torcedor G4",
    slug: "tailandesa-torcedor-g4",
    description: "Tailandesa Torcedor G4. Acabamento premium e variedade de modelos.",
    costMin: 100,
    costMax: 100,
    sortOrder: 3,
  },
  {
    name: "Conjuntos Infantis Tailandeses",
    slug: "conjuntos-infantis-tailandeses",
    description: "Conjuntos infantis (camisa + shorts) tailandeses. Leve e resistente para a garotada.",
    costMin: 90,
    costMax: 90,
    sortOrder: 4,
  },
  {
    name: "Retrô Tailandesas",
    slug: "retro-tailandesas",
    description: "Camisas retrô tailandesas. Clássicos que nunca saem de moda.",
    costMin: 130,
    costMax: 130,
    sortOrder: 5,
  },
  {
    name: "Camisas Nacionais Premium",
    slug: "camisas-nacionais-premium",
    description: "Camisas de seleções e times nacionais em versão premium.",
    costMin: 35,
    costMax: 35,
    sortOrder: 6,
  },
  {
    name: "Camisetas com Estampa DTF",
    slug: "camisetas-estampa-dtf",
    description: "Camisetas personalizadas com estampa DTF. Alta durabilidade da estampa.",
    costMin: 40,
    costMax: 40,
    sortOrder: 7,
  },
  {
    name: "Bonés Premium",
    slug: "bones-premium",
    description: "Bonés premium oficiais e licenciados. Complete o look da torcida.",
    costMin: 18,
    costMax: 18,
    sortOrder: 8,
  },
  {
    name: "Modelos Jogador Tailandeses",
    slug: "modelos-jogador-tailandeses",
    description: "Camisas modelo jogador tailandesas. Mesmo visual dos atletas em campo.",
    costMin: 130,
    costMax: 130,
    sortOrder: 9,
  },
  {
    name: "Conjuntos de Agasalho Tailandeses",
    slug: "conjuntos-agasalho-tailandeses",
    description: "Conjuntos de agasalho tailandeses (manga longa + calça). Ideal para dias frios.",
    costMin: 230,
    costMax: 230,
    sortOrder: 10,
  },
  {
    name: "Mangas Longas Tailandesas",
    slug: "mangas-longas-tailandesas",
    description: "Camisas mangas longas tailandesas. Conforto e estilo.",
    costMin: 130,
    costMax: 130,
    sortOrder: 11,
  },
  {
    name: "Kits de Treino Tailandeses",
    slug: "kits-treino-tailandeses",
    description: "Kits de treino tailandeses (regata + shorts). Performance no dia a dia.",
    costMin: 130,
    costMax: 130,
    sortOrder: 12,
  },
  {
    name: "Corta-vento Tailandeses",
    slug: "corta-vento-tailandeses",
    description: "Corta-vento tailandeses. Leve e proteção contra o vento.",
    costMin: 150,
    costMax: 150,
    sortOrder: 13,
  },
];

const SHIPPING = [
  { region: "Sudeste", price: 35, description: "SP, RJ, MG, ES" },
  { region: "Sul", price: 35, description: "PR, SC, RS" },
  { region: "Nordeste", price: 45, description: "Estados do Nordeste" },
  { region: "Norte", price: 45, description: "Estados do Norte" },
  { region: "Centro-Oeste", price: 45, description: "DF, GO, MT, MS" },
];

const FAQ = [
  {
    question: "Como escolher o tamanho da camisa?",
    answer:
      "Nossas camisas seguem tabela padrão brasileira. Consulte a tabela de medidas na página do produto. Em caso de dúvida entre dois tamanhos, recomendamos o maior para maior conforto.",
    sortOrder: 1,
  },
  {
    question: "Qual o prazo de entrega?",
    answer:
      "O prazo varia conforme sua região. Após a confirmação do pagamento e separação do pedido, o envio é realizado em até 2 dias úteis. O prazo dos Correios ou transportadora é informado no momento da compra.",
    sortOrder: 2,
  },
  {
    question: "Quais as formas de pagamento?",
    answer:
      "Aceitamos cartão de crédito (parcelado), boleto bancário e PIX. O pedido é confirmado após a aprovação do pagamento.",
    sortOrder: 3,
  },
  {
    question: "Como funciona a troca?",
    answer:
      "Trocas são aceitas em até 7 dias após o recebimento apenas por defeito de fabricação ou envio de tamanho errado. O cliente deve entrar em contato com fotos e descrição. Outros casos (arrependimento) não são cobertos pela política de troca.",
    sortOrder: 4,
  },
  {
    question: "Posso rastrear meu pedido?",
    answer:
      "Sim. Após o envio, você recebe o código de rastreio por e-mail e pode acompanhar no site dos Correios ou da transportadora.",
    sortOrder: 5,
  },
];

const SITE_CONFIG: [string, string][] = [
  [
    "about",
    JSON.stringify({
      title: "Quem somos",
      text: "A Torcida Urbana nasceu da paixão por futebol e pelo estilo das ruas. Unimos a qualidade das camisas tailandesas ao visual urbano que a torcida adora. Nossa missão é levar a identidade do seu time para o dia a dia com peças acessíveis e de boa qualidade. Acreditamos em futebol, estilo e atitude.",
    }),
  ],
  [
    "business_hours",
    JSON.stringify({
      text: "Pedidos aceitos das 10h às 17h. Atendimento encerra às 18h.",
      open: "10:00",
      close: "17:00",
      supportUntil: "18:00",
    }),
  ],
  [
    "return_policy",
    JSON.stringify({
      title: "Política de Trocas e Devoluções",
      text: "Aceitamos trocas em até 7 dias após o recebimento somente por defeito de fabricação ou envio de tamanho errado. Nesses casos, entre em contato com fotos e descrição do problema. Trocas por arrependimento ou outros motivos são de responsabilidade do cliente. O produto deve ser devolvido na embalagem original.",
    }),
  ],
  ["contact_whatsapp", "5511999999999"],
  ["contact_email", "contato@torcidaurbana.com.br"],
  ["contact_instagram", "https://instagram.com/torcidaurbana"],
  ["contact_facebook", "https://facebook.com/torcidaurbana"],
];

const SIZES_STANDARD = ["P", "M", "G", "GG", "XG"];
const SIZES_KIDS = ["2", "4", "6", "8", "10", "12", "14"];
const SIZES_ONE = ["Único"];

const SALE_PRICE_BY_SLUG: Record<string, { min: number; max: number }> = {
  "camisas-nacionais-premium": { min: 70, max: 100 },
  "camisetas-estampa-dtf": { min: 80, max: 120 },
  "bones-premium": { min: 50, max: 80 },
  "camisas-tailandesas-torcedor": { min: 130, max: 200 },
  "tailandesa-torcedor-g1": { min: 130, max: 200 },
  "tailandesa-torcedor-g4": { min: 150, max: 200 },
  "conjuntos-infantis-tailandeses": { min: 150, max: 300 },
  "retro-tailandesas": { min: 230, max: 230 },
  "modelos-jogador-tailandeses": { min: 300, max: 400 },
  "conjuntos-agasalho-tailandeses": { min: 300, max: 400 },
  "mangas-longas-tailandesas": { min: 230, max: 300 },
  "kits-treino-tailandeses": { min: 230, max: 300 },
  "corta-vento-tailandeses": { min: 250, max: 350 },
};

const SUPPLIERS = [
  { name: "Fornecedor 1", leadTimeDays: 5 },
  { name: "Fornecedor 2", leadTimeDays: 7 },
];

export async function runSeed() {
  console.log("Seed Torcida Urbana...");

  let supplier1Id: string | null = null;
  for (const s of SUPPLIERS) {
    let sup = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!sup) sup = await prisma.supplier.create({ data: { name: s.name, leadTimeDays: s.leadTimeDays } });
    else await prisma.supplier.update({ where: { id: sup.id }, data: { leadTimeDays: s.leadTimeDays } });
    if (s.name === "Fornecedor 1") supplier1Id = sup.id;
  }

  for (const c of CATEGORIES) {
    const imageUrl = CATEGORY_IMAGE_URL[c.slug] ?? null;
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        costMin: c.costMin,
        costMax: c.costMax,
        sortOrder: c.sortOrder,
        imageUrl,
      },
      update: {
        name: c.name,
        description: c.description,
        costMin: c.costMin,
        costMax: c.costMax,
        sortOrder: c.sortOrder,
        imageUrl,
      },
    });

    const sizes =
      c.slug === "conjuntos-infantis-tailandeses"
        ? SIZES_KIDS
        : c.slug === "bones-premium"
        ? SIZES_ONE
        : SIZES_STANDARD;

    const price = SALE_PRICE_BY_SLUG[c.slug] || { min: c.costMin * 2, max: c.costMax * 2 };
    const baseProductName = c.name.replace("Tailandesas", "Premium");
    const productSlug = `${c.slug}-modelo-01`;

    const productImageUrl = CATEGORY_IMAGE_URL[c.slug] ?? null;
    await prisma.product.upsert({
      where: { slug: productSlug },
      create: {
        categoryId: cat.id,
        supplierId: supplier1Id ?? undefined,
        name: `${baseProductName} - Modelo 01`,
        slug: productSlug,
        description: c.description,
        costMin: c.costMin,
        costMax: c.costMax,
        priceMin: price.min,
        priceMax: price.max,
        sizes: JSON.stringify(sizes),
        active: true,
        sortOrder: 1,
        imageUrl: productImageUrl,
      },
      update: {
        supplierId: supplier1Id ?? undefined,
        name: `${baseProductName} - Modelo 01`,
        description: c.description,
        costMin: c.costMin,
        costMax: c.costMax,
        priceMin: price.min,
        priceMax: price.max,
        sizes: JSON.stringify(sizes),
        active: true,
        sortOrder: 1,
        imageUrl: productImageUrl,
      },
    });
  }

  for (const item of SHIPPING) {
    const existing = await prisma.shippingPolicy.findFirst({ where: { region: item.region } });
    if (existing) {
      await prisma.shippingPolicy.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.shippingPolicy.create({ data: item });
    }
  }

  for (const item of FAQ) {
    const existing = await prisma.faq.findFirst({ where: { question: item.question } });
    if (existing) {
      await prisma.faq.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.faq.create({ data: item });
    }
  }

  for (const [key, value] of SITE_CONFIG) {
    await prisma.siteConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  const hashed = await bcrypt.hash(TEST_USER.password, 10);
  await prisma.user.upsert({
    where: { email: TEST_USER.email },
    create: {
      email: TEST_USER.email,
      passwordHash: hashed,
      name: TEST_USER.name,
      role: "ADMIN",
    },
    update: {
      passwordHash: hashed,
      name: TEST_USER.name,
      role: "ADMIN",
    },
  });

  // Chave admin: use "torcida-urbana-admin-secret" no painel (deve estar em ADMIN_API_KEY no .env)
  await prisma.siteConfig.upsert({
    where: { key: "admin_api_key" },
    create: { key: "admin_api_key", value: "torcida-urbana-admin-secret" },
    update: { value: "torcida-urbana-admin-secret" },
  });

  // PricingConfig padrão (canal site)
  await prisma.pricingConfig.upsert({
    where: { channel: "site" },
    create: {
      channel: "site",
      taxaCanalPercent: 0,
      taxaCanalFixa: 0,
      lucroMin: 30,
      lucroAlvo: 50,
      precoPsicologico: true,
      metaVendasAlta: 10,
      metaVendasBaixa: 2,
      ajusteUrgente: 20,
    },
    update: {},
  });

  // Fornecedor demo
  const existingSupplier = await prisma.supplier.findFirst({ where: { name: "Fornecedor Principal" } });
  if (!existingSupplier) {
    await prisma.supplier.create({
      data: { name: "Fornecedor Principal", whatsapp: "5511999999999", leadTimeDays: 3, active: true },
    });
  }

  // Pedidos demo (sempre adiciona 5 para testes)
    const products = await prisma.product.findMany({ take: 5, include: { category: true } });
    if (products.length > 0) {
      const DEMO_ORDERS = [
        {
          customerName: "João Silva",
          customerEmail: "joao@email.com",
          customerPhone: "11987654321",
          customerCpf: "123.456.789-00",
          addressStreet: "Rua das Flores",
          addressNumber: "123",
          addressComplement: "Apto 45",
          addressNeighborhood: "Centro",
          addressCity: "São Paulo",
          addressState: "SP",
          addressZip: "01310100",
          paymentMethod: "pix",
          paymentStatus: "aprovado",
          orderStatus: "aguardando",
          source: "site",
          subtotal: 265,
          shippingCost: 35,
          shippingCostPaid: 30,
          totalAmount: 300,
          totalCost: 165,
          estimatedProfit: 135,
        },
        {
          customerName: "Maria Santos",
          customerEmail: "maria@email.com",
          customerPhone: "21976543210",
          addressStreet: "Av. Brasil",
          addressNumber: "500",
          addressCity: "Rio de Janeiro",
          addressState: "RJ",
          addressZip: "20040020",
          paymentMethod: "cartao",
          paymentStatus: "aprovado",
          orderStatus: "em_separacao",
          source: "site",
          subtotal: 430,
          shippingCost: 35,
          totalAmount: 465,
          totalCost: 280,
          estimatedProfit: 185,
        },
        {
          customerName: "Pedro Oliveira",
          customerEmail: "pedro@email.com",
          addressStreet: "Rua XV",
          addressNumber: "100",
          addressCity: "Curitiba",
          addressState: "PR",
          addressZip: "80020000",
          paymentMethod: "boleto",
          paymentStatus: "pendente",
          orderStatus: "aguardando",
          source: "shopee",
          subtotal: 150,
          shippingCost: 45,
          totalAmount: 195,
          totalCost: 95,
          estimatedProfit: 100,
        },
        {
          customerName: "Ana Costa",
          customerEmail: "ana@email.com",
          customerPhone: "31999887766",
          addressStreet: "Av. Afonso Pena",
          addressNumber: "1500",
          addressCity: "Belo Horizonte",
          addressState: "MG",
          addressZip: "30130002",
          paymentMethod: "pix",
          paymentStatus: "aprovado",
          orderStatus: "enviado",
          source: "site",
          trackingCode: "BR123456789BR",
          trackingUrl: "https://rastreio.correios.com.br",
          subtotal: 520,
          shippingCost: 40,
          shippingCostPaid: 35,
          totalAmount: 560,
          totalCost: 320,
          estimatedProfit: 240,
        },
        {
          customerName: "Carlos Lima",
          customerEmail: "carlos@email.com",
          addressStreet: "Rua da Praia",
          addressNumber: "88",
          addressCity: "Fortaleza",
          addressState: "CE",
          addressZip: "60165100",
          paymentMethod: "cartao",
          paymentStatus: "aprovado",
          orderStatus: "entregue",
          source: "ml",
          subtotal: 180,
          shippingCost: 45,
          totalAmount: 225,
          totalCost: 120,
          estimatedProfit: 105,
        },
      ];

      const lastOrder = await prisma.order.findFirst({ orderBy: { createdAt: "desc" }, select: { orderNumber: true } });
      const startNum = lastOrder ? parseInt(lastOrder.orderNumber.replace(/\D/g, ""), 10) + 1 : 1001;

      for (let i = 0; i < DEMO_ORDERS.length; i++) {
        const o = DEMO_ORDERS[i];
        const prod = products[i % products.length];
        const unitPrice = prod.priceMin + (prod.priceMax - prod.priceMin) * 0.5;
        const unitCost = prod.costMin;
        const qty = i === 1 ? 2 : 1;
        await prisma.order.create({
          data: {
            orderNumber: String(startNum + i),
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            customerPhone: o.customerPhone ?? null,
            customerCpf: o.customerCpf ?? null,
            addressStreet: o.addressStreet,
            addressNumber: o.addressNumber,
            addressComplement: o.addressComplement ?? null,
            addressNeighborhood: o.addressNeighborhood ?? null,
            addressCity: o.addressCity,
            addressState: o.addressState,
            addressZip: o.addressZip,
            subtotal: o.subtotal,
            shippingCost: o.shippingCost,
            shippingCostPaid: o.shippingCostPaid ?? null,
            totalAmount: o.totalAmount,
            totalCost: o.totalCost,
            estimatedProfit: o.estimatedProfit,
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            orderStatus: o.orderStatus,
            source: o.source,
            trackingCode: o.trackingCode ?? null,
            trackingUrl: o.trackingUrl ?? null,
            items: {
              create: [
                {
                  productId: prod.id,
                  productName: prod.name,
                  variation: i % 2 === 0 ? "M" : "G",
                  sku: `SKU-${prod.slug.slice(0, 8)}`,
                  quantity: qty,
                  unitPrice,
                  unitCost,
                  lineTotal: unitPrice * qty,
                  lineCost: unitCost * qty,
                  personalization: i % 3 === 0 ? "10" : i % 3 === 1 ? "Neymar Jr" : null,
                  itemNotes: i === 2 ? "Cliente pediu embalagem de presente" : null,
                },
              ],
            },
          },
        });
      }
      console.log("Pedidos demo criados.");
    }

  console.log("Seed concluído.");
}
