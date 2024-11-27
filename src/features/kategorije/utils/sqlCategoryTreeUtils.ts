import { prisma } from "../../../database/prismaClient";
import { Kategorije } from "../kategorijeValidator";

// Level is depth from the selected category. TotalItems is the number of items below the category
type CategoryWithLevel = Kategorije & { level: number; totalItems?: number };

export async function getAllCategoryDescendants(
  categoryId: string
): Promise<Kategorije[]> {
  const descendants = await prisma.$queryRaw<Kategorije[]>`
    WITH RECURSIVE Descendants AS (
      SELECT *
      FROM Kategorije
      WHERE id = ${categoryId}

      UNION ALL

      SELECT k.*
      FROM Kategorije k
      INNER JOIN Descendants d ON k.parentId = d.id
    )
    SELECT *
    FROM Descendants
    WHERE id != ${categoryId};`;

  return descendants;
}

async function getTotalItemsUnderCategory(categoryId: string): Promise<number> {
  const descendants = await getAllCategoryDescendants(categoryId);
  const categoryIds = [categoryId, ...descendants.map((c) => c.id)];

  const totalItems = await prisma.item.count({
    where: {
      kategorijaId: { in: categoryIds },
    },
  });

  return totalItems;
}

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
  const parentsWithItemCounts = await Promise.all(
    parents.map(async (parent) => {
      const totalItems = await getTotalItemsUnderCategory(parent.id);
      return { ...parent, totalItems };
    })
  );

  const siblings = await getSiblings(selectedCategory.parentId);
  const siblingsWithItemCounts = await Promise.all(
    siblings.map(async (sibling) => {
      const totalItems = await getTotalItemsUnderCategory(sibling.id);
      return { ...sibling, totalItems };
    })
  );

  const children = await getChildren(categoryId);
  const childrenWithItemCounts = await Promise.all(
    children.map(async (child) => {
      const totalItems = await getTotalItemsUnderCategory(child.id);
      return { ...child, totalItems };
    })
  );

  return {
    selectedCategory,
    parents: parentsWithItemCounts,
    siblings: siblingsWithItemCounts,
    children: childrenWithItemCounts,
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
