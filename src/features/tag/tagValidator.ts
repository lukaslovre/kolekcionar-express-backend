import { z } from "zod";

export const tagSchema = z.object({
  id: z.string().uuid(),
  naziv: z.string(),
});

export const tagSchemaCreate = tagSchema.omit({ id: true });
