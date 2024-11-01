import { z } from "zod";

export const kategorijeSchema = z.object({
  id: z.string().uuid(),
  nazivId: z.string(),
  parentId: z.string().uuid().optional(),
  drzavaId: z.string().optional(),
  isDead: z.boolean().optional(),
  opis: z.string().optional(),
  count: z.number().int().optional(),
});

// Use the Zod ability to remove properties from the schema
export const kategorijeSchemaCreate = kategorijeSchema.omit({ id: true });
