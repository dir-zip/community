'use server'
import 'server-only'
import { prisma, type Post } from "@dir/db";
import { z } from "zod";
import {createAction} from '../../lib/createAction';
import { PostSchema } from "@/features/posts/schemas";
import { findFreeSlug } from "@/lib/utils";
import { revalidatePath } from 'next/cache'

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



export const createPost = createAction(async({session}, {title, body, category, tags}) => {
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

  const post = await prisma.post.create({
    data: {
      title,
      body,
      slug: createSlug,
      categoryId: getCategory?.id!,
      userId: session?.data.userId!
    }
  })

  return post

}, PostSchema)

export const getSinglePost = createAction(async({}, {slug}) => {
  const post = await prisma.post.findFirst({
    where:{ 
      slug: slug
    },
    include: {
      user: true,
      category: true,
      comments: {
        include: {
          user: true,
          parent: true
        }
      }
    }
  })

  return post
}, z.object({
  slug: z.string()
}))

export const updatePost = createAction(async({}, {id, data}) => {
  const currentPost = await prisma.post.findUnique({ where: { id } });

  let slug;
  if (currentPost?.title !== data.title) {
    slug = await findFreeSlug<Post>(
      data.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      async (slug: string) =>
        await prisma.post.findUnique({ where: { slug } }),
    );
  } else {
    slug = currentPost.slug;
  }

  // const post = await prisma.post.update({
  //   where:{ 
  //     id
  //   },
  //   data: {
  //     ...data,
  //     slug,
  //     tags: data.tags.map(tag => ({
        
  //     })),
  //   }
  // })

  // return post
}, z.object({
  id: z.string(),
  data: PostSchema
}))

export const createComment = createAction(async({session}, {postId, body}) => {

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: session?.data.userId!,
      body
    }
  })
  revalidatePath('/posts/[slug]')

  return comment
}, z.object({
  postId: z.string(),
  body: z.string()
}))

export const getCommentsForPost = createAction(async({}, {postId}) => {
  const comments = await prisma.comment.findMany({
    where: {
      postId
    },
    include: {
      user: true
    }
  })

  return comments
}, z.object({
  postId: z.string()
}))

