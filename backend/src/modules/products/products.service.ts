import { prisma } from "../../shared/prisma.js";
import { notFound } from "../../shared/errors.js";

export async function listProducts(filters?: { categorySlug?: string; activeOnly?: boolean }) {
  const where: { active?: boolean; category?: { slug: string } } = {};
  if (filters?.activeOnly !== false) where.active = true;
  if (filters?.categorySlug) where.category = { slug: filters.categorySlug };

  return prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      priceMin: true,
      priceMax: true,
      imageUrl: true,
      sizes: true,
      active: true,
      sortOrder: true,
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

/** Lista produtos com fornecedor e custo — só para painel admin (cliente não vê fornecedor). */
export async function listProductsForAdmin(filters?: { categorySlug?: string; activeOnly?: boolean }) {
  const where: { active?: boolean; category?: { slug: string } } = {};
  if (filters?.activeOnly !== false) where.active = true;
  if (filters?.categorySlug) where.category = { slug: filters.categorySlug };

  return prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      costMin: true,
      costMax: true,
      priceMin: true,
      priceMax: true,
      imageUrl: true,
      sizes: true,
      active: true,
      sortOrder: true,
      category: { select: { id: true, name: true, slug: true } },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      priceMin: true,
      priceMax: true,
      imageUrl: true,
      sizes: true,
      active: true,
      sortOrder: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          active: true,
          sortOrder: true,
        },
      },
      variants: {
        select: {
          id: true,
          productId: true,
          size: true,
          sku: true,
        },
      },
    },
  });
  if (!product) throw notFound("Produto não encontrado");
  return product;
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, variants: true },
  });
  if (!product) throw notFound("Produto não encontrado");
  return product;
}

export async function createProduct(data: {
  categoryId: string;
  supplierId?: string | null;
  name: string;
  slug: string;
  description?: string;
  costMin: number;
  costMax: number;
  priceMin: number;
  priceMax: number;
  imageUrl?: string;
  sizes?: string[];
  active?: boolean;
  variants?: Array<{ size: string; quantity: number; sku?: string }>;
}) {
  const { variants, ...productData } = data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      supplierId: productData.supplierId ?? undefined,
      sizes: variants ? JSON.stringify(variants.map(v => v.size)) : (productData.sizes ? JSON.stringify(productData.sizes) : "[]"),
      variants: variants ? {
        create: variants.map(v => ({
          size: v.size,
          quantity: v.quantity,
          sku: v.sku
        }))
      } : undefined
    },
    include: { variants: true, category: true, supplier: true }
  });

  return product;
}

export async function updateProductStock(id: string, updates: Array<{ size: string; quantity: number }>) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw notFound("Produto não encontrado");

  await prisma.$transaction(
    updates.map(u =>
      prisma.productVariant.upsert({
        where: { productId_size: { productId: id, size: u.size } },
        create: { productId: id, size: u.size, quantity: u.quantity },
        update: { quantity: u.quantity }
      })
    )
  );

  const allVariants = await prisma.productVariant.findMany({ where: { productId: id }, select: { size: true } });
  const sizes = allVariants.map(v => v.size);
  await prisma.product.update({
    where: { id },
    data: { sizes: JSON.stringify(sizes) }
  });

  return getProductById(id);
}
