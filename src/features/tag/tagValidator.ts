import { z } from "zod";

export const tagSchema = z.object({
  id: z.string().uuid(),
  naziv: z.string(),
  group: z.string(),
  displayOnCard: z.boolean().optional(),
  displayOnDetails: z.boolean().optional(),
  description: z.string().optional(),
});

export const tagSchemaCreate = tagSchema.omit({ id: true });
