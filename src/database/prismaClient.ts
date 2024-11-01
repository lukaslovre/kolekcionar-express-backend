// Note: using SQLite database
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function main() {
  const allCategories = await prisma.kategorije.findMany();

  console.log(allCategories);
}
