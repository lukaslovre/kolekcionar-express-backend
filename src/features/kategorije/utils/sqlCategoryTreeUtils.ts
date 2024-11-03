import { prisma } from "../../../database/prismaClient";
import { Kategorije } from "../kategorijeValidator";
type CategoryWithLevel = Kategorije & { level: number };

export async function getCategoriesTreeFromDb(categoryId: string) {
  const selectedCategory = await prisma.kategorije.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!selectedCategory) {
    throw new Error("Category not found");
  }

  const parents = await getAllParents(selectedCategory.id);
  const siblings = await getSiblings(selectedCategory.parentId);
  const children = await getChildren(categoryId);

  return {
    selectedCategory,
    parents,
    siblings,
    children,
  };
}

async function getAllParents(categoryId: string) {
  const parents = await prisma.$queryRaw<CategoryWithLevel[]>`
    WITH RECURSIVE CategoryPath AS (
      -- Base case: start with the given category
      SELECT *, 0 as level
      FROM Kategorije
      WHERE id = ${categoryId} -- category ID to start from

      UNION ALL

      -- Recursive case: join with parent categories
      SELECT k.*, (cp.level + 1) as level
      FROM Kategorije k
      INNER JOIN CategoryPath cp ON k.id = cp.parentId
      WHERE k.parentId IS NOT NULL
    )
    SELECT * 
    FROM CategoryPath
    WHERE id != ${categoryId}
    ORDER BY level DESC;`;

  // Invert the levels so that the top level is 0

  const maxLevel = Math.max(...parents.map((p) => Number(p.level)), 0);

  const parentsParsed = parents.map((p) => {
    return { ...p, level: maxLevel - Number(p.level) };
  });

  return parentsParsed;
}

async function getSiblings(parentId: string | null) {
  const siblings = await prisma.kategorije.findMany({
    where: {
      parentId: parentId,
    },
  });

  return siblings;
}

async function getChildren(categoryId: string) {
  const directChildren = await prisma.kategorije.findMany({
    where: {
      parentId: categoryId,
    },
  });

  return directChildren;
}
