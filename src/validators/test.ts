import { z } from "zod";

export const testSchema = z.object({
  name: z.string(),
  email: z.string().email("Neispravan email"),
  age: z.number().min(18, "Mora biti punoljetan"),
});

// {
// 	"name":"Pero",
// 	"email":"pero@gmail.com",
// 	"age":20
// }

export type Test = z.infer<typeof testSchema>;
