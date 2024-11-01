import type { Kategorije } from "./features/kategorije/kategorijeValidator";

interface CategoryTreeResponse {
  ancestors: Kategorije[];
  siblings: Kategorije[];
  children: Kategorije[];
}
