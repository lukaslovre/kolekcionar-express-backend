import { z } from "zod";

export const itemSchema = z.object({
  id: z.number(),
  cijena: z.number().positive(),
  limit: z.number().int().positive().optional(),
  nazivId: z.string().max(128),
  kategorijaId: z.string().uuid(),
  opis: z.string().optional(),
  groupId: z.string().uuid().optional(),
  tags: z.array(z.string().uuid()).optional(),
  images: z.array(z.string().uuid()).optional(),
  vrijemeDodavanja: z.date().optional(), // How does Zod handle dates? Does it have to be a Date object, or can it be a valid string? Answer: It can be a valid string.
  tip: z.string().optional(),
  countryId: z.string().uuid().optional(),
  nominala: z.number().optional(),
  godina: z.number().optional(),
  mintage: z.number().optional(),
  promjer: z.number().optional(),
  masa: z.number().optional(),
  visina: z.number().optional(),
  sirina: z.number().optional(),
  duljina: z.number().optional(),
});

// The extended fields are the ones that have a default value
export const itemSchemaCreate = itemSchema.omit({ id: true }).extend({
  images: z.array(z.string().url()).optional(),
});

export type Item = z.infer<typeof itemSchema>;
