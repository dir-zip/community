"use server"

import { count, db, eq, or } from "@dir/db";
import { z } from "zod";


import { createAction } from '../../../../lib/createAction';
import { CategorySchema } from "../../../../features/posts/schemas";
import { findFreeSlug } from "../../../../lib/utils";
import { category } from "packages/db/drizzle/schema";


export const createCategory = createAction(async ({ }, { title }) => {
  const createSlug = await findFreeSlug(
    title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    async (slug: string) =>
      await db.query.category.findFirst({ where: (cate, { eq }) => eq(cate.slug, slug) })
  );


  const createdCategories = await db.insert(category)
    .values({
      title,
      slug: createSlug
    })
    .returning();

  const createdCategory = createdCategories[0];
  return createdCategory

}, CategorySchema)

export const getSingleCategory = createAction(async ({ }, { id }) => {
  const categoryResult = await db.query.category.findFirst({
    where: (cate, { eq }) => eq(cate.id, id)
  })

  return categoryResult
}, z.object({
  id: z.string()
}))

export const updateCategory = createAction(async ({ }, { id, data }) => {
  // Fetch the current category
  const currentCategory = await db.query.category.findFirst({ where: (cate, { eq }) => eq(cate.id, id) });

  let slug;
  // If the title has changed, generate a new slug
  if (currentCategory?.title !== data.title) {
    slug = await findFreeSlug(
      data.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      async (slug: string) =>
        await db.query.category.findFirst({ where: (cate, { eq }) => eq(cate.slug, slug) })
    );
  } else {
    // If the title hasn't changed, keep the current slug
    slug = currentCategory.slug;
  }

  const updatedCategories = await db.update(category)
    .set({
      ...data,
      slug
    })
    .where(eq(category.id, id))
    .returning();

  const updatedCategory = updatedCategories[0];
  return updatedCategory
}, z.object({
  id: z.string(),
  data: CategorySchema
}))

export const getAllCategories = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params;

    const whereIdCondition = where?.OR?.find((condition: any) => condition?.id !== undefined)?.id;


    const findCategories = await db.query.category.findMany({
      where: (item, { or, eq }) => or(whereIdCondition ? eq(item.id, whereIdCondition) : undefined),
      limit: take,
      offset: skip
    })

    const categoryCountResult = await db.select({ count: count() })
      .from(category)
      .where(or(whereIdCondition ? eq(category.id, whereIdCondition) : undefined))

    const categoryCount: number = categoryCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { categories: findCategories, count: categoryCount }
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any()
  })
)