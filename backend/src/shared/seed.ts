import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_USER = {
  email: "painel@torcidaurbana.com.br",
  password: "painel123",
  name: "Administrador Torcida Urbana",
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

export async function runSeed() {
  console.log("Seed Torcida Urbana...");

  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        costMin: c.costMin,
        costMax: c.costMax,
        sortOrder: c.sortOrder,
      },
      update: {
        name: c.name,
        description: c.description,
        costMin: c.costMin,
        costMax: c.costMax,
        sortOrder: c.sortOrder,
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

    await prisma.product.upsert({
      where: { slug: productSlug },
      create: {
        categoryId: cat.id,
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
      },
      update: {
        name: `${baseProductName} - Modelo 01`,
        description: c.description,
        costMin: c.costMin,
        costMax: c.costMax,
        priceMin: price.min,
        priceMax: price.max,
        sizes: JSON.stringify(sizes),
        active: true,
        sortOrder: 1,
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

  console.log("Seed concluído.");
}
