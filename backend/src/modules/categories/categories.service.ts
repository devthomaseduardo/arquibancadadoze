import { prisma } from "../../shared/prisma.js";
import { notFound } from "../../shared/errors.js";

export async function listCategories(activeOnly = true) {
  return prisma.category.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      active: true,
      sortOrder: true,
      products: {
        where: activeOnly ? { active: true } : undefined,
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
        },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      active: true,
      sortOrder: true,
      products: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
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
        },
      },
    },
  });
  if (!category) throw notFound("Categoria não encontrada");
  return category;
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: true },
  });
  if (!category) throw notFound("Categoria não encontrada");
  return category;
}
