import { Prisma } from "@prisma/client";
import { prisma } from "../../../database/prismaClient";
import { itemSchemaCreate } from "../../item/itemValidator";
import { kategorijeSchema } from "../../kategorije/kategorijeValidator";
import { z } from "zod";

const SpecificKategorijaValidator = kategorijeSchema.omit({
  id: true,
  drzavaId: true,
  isDead: true,
  count: true,
});

type SpecificKategorija = z.infer<typeof SpecificKategorijaValidator>;

const SpecificItemCreateValidator = itemSchemaCreate.omit({
  kategorijaId: true,
});

type SpecificItemCreate = z.infer<typeof SpecificItemCreateValidator>;

export async function importCategoryAndItems(
  category: SpecificKategorija,
  items: SpecificItemCreate[]
) {
  const rootCategoryId = "7aa0cbc1-269c-4074-b05b-7537f60e6b0c"; // Ručno pročitano iz baze

  try {
    // Validate data
    if (!Array.isArray(items)) throw new Error("Items must be an array");
    category = SpecificKategorijaValidator.parse(category);
    items = items.map((item) => itemSchemaCreate.parse(item));

    // Make the QueryData type be the one from the Prisma args.data type
    type QueryDataItems = Prisma.XOR<
      Prisma.KategorijeCreateInput,
      Prisma.KategorijeUncheckedCreateInput
    >["items"];

    const itemsWithPrismaRelations: QueryDataItems = {
      create: items.map((item) => {
        const { tags, images } = item;

        // Create tags query
        if (tags && Array.isArray(tags) && tags.length > 0) {
          item.tags = {
            connectOrCreate: tags.map((tag) => ({
              where: { naziv: tag },
              create: { naziv: tag },
            })),
          };
        } else {
          item.tags = undefined;
        }

        // Create images query
        if (images && Array.isArray(images) && images.length > 0) {
          item.images = {
            create: images.map((image) => ({ url: image })),
          };
        } else {
          item.images = undefined;
        }

        return item;
      }),
    };

    const response = await prisma.kategorije.create({
      data: {
        nazivId: category.nazivId,
        parentId: category.parentId || rootCategoryId,
        opis: category.opis,
        items: itemsWithPrismaRelations,
        // items: {
        //   create: [
        //     {
        //       ...items[0],
        //       tags: {
        //         connectOrCreate: [
        //           {
        //             where: { naziv: items[0].tags[0] },
        //             create: { naziv: items[0].tags[0] },
        //           },
        //         ],
        //       },
        //       images: {
        //         create: [
        //           {
        //             url: items[0].images[0],
        //           },
        //         ],
        //       },
        //     },
        //   ],
        // },
      },
    });
  } catch (error) {
    console.log(error);
  }
}
