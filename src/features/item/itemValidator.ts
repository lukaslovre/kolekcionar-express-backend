import { z } from "zod";

const tagSchema = z.object({
  id: z.string().uuid(),
  naziv: z.string().optional(),
});

const imageSchema = z.object({
  id: z.string().uuid(),
  url: z.string().optional(),
});

export const itemSchema = z.object({
  id: z.number(),
  cijena: z.number().positive(),
  limit: z.number().int().positive(),
  nazivId: z.string().max(128),
  kategorijaId: z.string().uuid(),
  opis: z.string().optional(),
  tags: z.array(tagSchema),
  images: z.array(imageSchema),
  vrijemeDodavanja: z.date(), // How does Zod handle dates? Does it have to be a Date object, or can it be a valid string? Answer: It can be a valid string.
  tip: z.string(),
  nominala: z.number().optional(),
  valuta: z.string().optional(),
  godina: z.number().optional(),
  kralj: z.string().optional(),
  mintage: z.number().optional(),
  materijal: z.string().optional(),
  promjer: z.number().optional(),
  masa: z.number().optional(),
  kvaliteta: z.string().optional(),
  pick: z.string().optional(),
  serija: z.string().optional(),
  naselje: z.string().optional(),
  vrstaKamena: z.string().optional(),
  visina: z.number().optional(),
  sirina: z.number().optional(),
  duljina: z.number().optional(),
});

// The extended fields are the ones that have a default value
export const itemSchemaCreate = itemSchema.omit({ id: true }).extend({
  limit: z.number().int().positive().optional(),
  vrijemeDodavanja: z.date().optional(),
  tip: z.string().optional(),

  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export type Item = z.infer<typeof itemSchema>;
