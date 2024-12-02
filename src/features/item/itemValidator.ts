import { z } from "zod";

// const imageSchema = z.object({
//   id: z.string().uuid(),
//   url: z.string().optional(),
// });

export const itemSchema = z.object({
  id: z.number(),
  cijena: z.number().positive(),
  limit: z.number().int().positive(),
  nazivId: z.string().max(128),
  kategorijaId: z.string().uuid(),
  opis: z.string().optional(),
  groupId: z.string().optional(),
  tags: z.array(z.string()),
  images: z.array(z.string()),
  vrijemeDodavanja: z.date(), // How does Zod handle dates? Does it have to be a Date object, or can it be a valid string? Answer: It can be a valid string.
  tip: z.string(),
  countryId: z.string().optional(),
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
export const itemSchemaCreate = itemSchema.omit({ id: true }).partial({
  limit: true,
  vrijemeDodavanja: true,
  tip: true,
  tags: true,
  images: true,
});

export type Item = z.infer<typeof itemSchema>;
