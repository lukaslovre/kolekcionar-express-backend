// Note: using SQLite database
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

// Uncomment to get query exceution times

// prisma.$use(async (params, next) => {
//   const start = Date.now();
//   const result = await next(params);
//   const end = Date.now();

//   console.log(`${params.model}.${params.action} took ${end - start}ms`);
//   return result;
// });
