"use server"

import { prisma, type Category } from "@dir/db";
import { z } from "zod";


import {createAction} from '../../../../lib/createAction';
import { CategorySchema } from "../../../../features/posts/schemas";
import { findFreeSlug } from "../../../../lib/utils";


export const createCategory = createAction(async({}, {title}) => {


  const createSlug = await findFreeSlug<Category>(
    title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    async (slug: string) =>
      await prisma.category.findUnique({ where: { slug } }),
  );

  const category = await prisma.category.create({
    data: {
      title,
      slug: createSlug
    }
  })

  return category

}, CategorySchema)

export const getSingleCategory = createAction(async({}, {id}) => {
  const category = await prisma.category.findFirst({
    where:{ 
      id
    }
  })

  return category
}, z.object({
  id: z.string()
}))

export const updateCategory = createAction(async({}, {id, data}) => {
  // Fetch the current category
  const currentCategory = await prisma.category.findUnique({ where: { id } });

  let slug;
  // If the title has changed, generate a new slug
  if (currentCategory?.title !== data.title) {
    slug = await findFreeSlug<Category>(
      data.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      async (slug: string) =>
        await prisma.category.findUnique({ where: { slug } }),
    );
  } else {
    // If the title hasn't changed, keep the current slug
    slug = currentCategory.slug;
  }

  const category = await prisma.category.update({
    where:{ 
      id
    },
    data: {
      ...data,
      slug
    }
  })

  return category
}, z.object({
  id: z.string(),
  data: CategorySchema
}))


export const getAllCategories = createAction(
  async({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params;

    const findCategories = await prisma.category.findMany({
      take,
      skip,
      where
    })

    const count = await prisma.category.count({
      where
    })

    return {categories: findCategories, count}
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any()
  })
)