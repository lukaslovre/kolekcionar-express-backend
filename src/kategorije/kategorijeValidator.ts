import { z } from "zod";

// model Kategorije {
//     id       String   @id @default(uuid())
//     nazivId  String
//     parentId String?
//     drzavaId String?
//     isDead     Boolean  @default(false)
//     opis     String?
//     count    Int      @default(0)
//   }

export const kategorijeSchema = z.object({
  nazivId: z.string(),
  parentId: z.string().uuid().optional(),
  drzavaId: z.string().optional(),
  isDead: z.boolean().optional(),
  opis: z.string().optional(),
  count: z.number().int().optional(),
});
