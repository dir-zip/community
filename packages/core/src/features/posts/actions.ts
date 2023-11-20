'use server'
import 'server-only'
import { prisma, type Post } from "@dir/db";
import { z } from "zod";
import {createAction} from '../../lib/createAction';
import { PostSchema } from "@/features/posts/schemas";
import { findFreeSlug } from "@/lib/utils";
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
      userId: session?.data.userId!,
      tags: {
        connectOrCreate: tags.split(',').map(tagSlug => ({
          where: { slug: tagSlug },
          create: { title: tagSlug, slug: tagSlug }
        }))
      }
    }
  })

  


  await triggerAction({title: "CREATE_POST"})

  return post

}, PostSchema, {authed: true})

export const getSinglePost = createAction(async({}, {slug}) => {
  const post = await prisma.post.findFirst({
    where:{ 
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

export const updatePost = createAction(async({validate, session}, {slug, data}) => {
  await validate(['UPDATE', "post", slug])
  const currentPost = await prisma.post.findUnique({ where: { slug }, include: {tags: true} });


  console.log(data.category)

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

  const mappedTags = prepareArrayField(
    data.tags.split(",").map((c) => {
      return { id: c }
    }) || [],
    currentPost?.tags,
    (item) => ({
      ...item,
    }),
    { removedItemsMethod: "disconnect" }
  )

  const post = await prisma.post.update({
    where:{ 
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
}), {authed: true})

export const createComment = createAction(async({session}, {postSlug, body, parentId}) => {
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

  await triggerAction({title: "CREATE_COMMENT"})
  revalidatePath('/posts/[slug]')

  return comment
}, z.object({
  postSlug: z.string(),
  parentId: z.string().nullable(),
  body: z.string()
}), {authed: true})



