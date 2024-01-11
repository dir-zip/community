'use server'

import { prisma, type Post, Tag } from "@dir/db";
import { z } from "zod";
import { createAction } from '../../lib/createAction';
import { PostSchema } from "../../features/posts/schemas";
import { findFreeSlug } from "@/utils";
import { revalidatePath } from 'next/cache'
import { prepareArrayField } from "@creatorsneverdie/prepare-array-for-prisma"
import { triggerAction } from '../actions/actions';


export const getCategories = createAction(async () => {
  const categories = await prisma.category.findMany()
  return categories
})

export const getAllPosts = createAction(async () => {

  const categoryWithPosts = await prisma.category.findMany({
    include: {
      posts: {
        include: {
          user: true
        }
      }
    }
  })

  return categoryWithPosts
})



export const createPost = createAction(async ({ session }, { title, body, category, tags }) => {
  const createSlug = await findFreeSlug<Post>(
    title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    async (slug: string) =>
      await prisma.post.findUnique({ where: { slug } }),
  );

  const getCategory = await prisma.category.findFirst({
    where: {
      slug: category
    }
  })

  const newTags = await Promise.all(
    tags.split(",").map(async (tagSlug) => {
      tagSlug = tagSlug.trim(); // Trim whitespace

      if (!tagSlug) return null; // Skip empty strings

      // Check if the tag already exists
      const existingTag = await prisma.tag.findUnique({ where: { slug: tagSlug } });

      if (existingTag) {
        // If the tag exists, return it to connect to it
        return { id: existingTag.id };
      } else {
        // If the tag doesn't exist, generate a new slug and create a new tag
        const updatedTagSlug = await findFreeSlug<Tag>(
          tagSlug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          async (slug: string) =>
            await prisma.tag.findUnique({ where: { slug } }),
        );

        return { title: tagSlug, slug: updatedTagSlug };
      }
    })
  );

  const filteredTags = newTags.filter(Boolean);


  const post = await prisma.post.create({
    data: {
      title,
      body,
      slug: createSlug,
      categoryId: getCategory?.id!,
      userId: session?.data.userId!,
      tags: prepareArrayField(
        filteredTags.map((c) => {
          return c
        })
      ),
    }
  })

  await triggerAction({ title: "CREATE_POST" })

  return post

}, PostSchema, { authed: true })

export const getSinglePost = createAction(async ({ }, { slug }) => {
  const post = await prisma.post.findFirst({
    where: {
      slug: slug
    },
    include: {
      user: true,
      category: true,
      tags: true
    }
  })

  return post
}, z.object({
  slug: z.string()
}))

export const updatePost = createAction(async ({ validate, session }, { slug, data }) => {
  await validate(['UPDATE', "post", slug])
  const currentPost = await prisma.post.findUnique({ where: { slug }, include: { tags: true } });


  let newSlug;
  if (currentPost?.title !== data.title) {
    newSlug = await findFreeSlug<Post>(
      data.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      async (slug: string) =>
        await prisma.post.findUnique({ where: { slug } }),
    );
  } else {
    newSlug = currentPost.slug;
  }

  const newTags = await Promise.all(
    data.tags.split(",").map(async (tagSlug) => {
      tagSlug = tagSlug.trim(); // Trim whitespace

      if (!tagSlug) return null; // Skip empty strings

      // Check if the tag already exists
      const existingTag = await prisma.tag.findUnique({ where: { slug: tagSlug } });

      if (existingTag) {
        // If the tag exists, return it to connect to it
        return { id: existingTag.id };
      } else {
        // If the tag doesn't exist, generate a new slug and create a new tag
        const updatedTagSlug = await findFreeSlug<Tag>(
          tagSlug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          async (slug: string) =>
            await prisma.tag.findUnique({ where: { slug } }),
        );

        return { title: tagSlug, slug: updatedTagSlug };
      }
    })
  );

  const filteredTags = newTags.filter(Boolean);


  const mappedTags = prepareArrayField(
    filteredTags,
    currentPost?.tags,
    (item) => ({
      ...item,
    }),
    { removedItemsMethod: "disconnect" }
  )

  const post = await prisma.post.update({
    where: {
      slug
    },
    data: {
      ...data,
      slug: newSlug,
      category: {
        connect: {
          slug: data.category
        }
      },
      tags: mappedTags
    }
  })

  return post
}, z.object({
  slug: z.string(),
  data: PostSchema
}), { authed: true })

export const createComment = createAction(async ({ session }, { postSlug, body, parentId }) => {
  const post = await prisma.post.findFirst({
    where: {
      slug: postSlug
    }
  })

  const comment = await prisma.comment.create({
    data: {
      postId: post!.id,
      userId: session?.data.userId!,
      body,
      parentId: parentId || null
    }
  })

  await triggerAction({ title: "CREATE_COMMENT" })
  revalidatePath('/posts/[slug]')

  return comment
}, z.object({
  postSlug: z.string(),
  parentId: z.string().nullable(),
  body: z.string()
}), { authed: true })



