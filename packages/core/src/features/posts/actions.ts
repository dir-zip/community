'use server'

import { prisma, type Post, Tag, Inventory } from "@dir/db";
import { z } from "zod";
import { createAction } from '~/lib/createAction';
import { PostSchema } from "~/features/posts/schemas";
import { findFreeSlug } from "@/utils";
import { revalidatePath } from 'next/cache'
import { prepareArrayField } from "@creatorsneverdie/prepare-array-for-prisma"
import { triggerAction } from '../actions/actions';
import { userInventoryIncludes } from "~/lib/includes";
import { sendEmail } from "~/jobs";


export const getCategories = createAction(async () => {
  const categories = await prisma.category.findMany()
  return categories
})

export const getAllPosts = createAction(async ({}, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { skip, take, tags, categorySlug } = params;

  let whereClause: {
    tags?: {
      some?: { slug: { in: string[], not?: string } },
      none?: { slug: string }
    },
    category?: {
      slug?: string
    }
  } = {};

  if (tags && tags.length > 0) {
    whereClause.tags = {
      some: {
        slug: {
          in: tags,
          not: 'feed'
        }
      }
    };
  } else {
    whereClause.tags = {
      none: {
        slug: 'feed'
      }
    };
  }

  if (categorySlug && categorySlug !== "all") {
    whereClause.category = {
      slug: categorySlug
    };
  }

  const posts = await prisma.post.findMany({
    skip,
    take,
    where: whereClause,
    include: {
      user: userInventoryIncludes.user,
      broadcast: true,
      category: {
        select: {
          title: true,
          slug: true
        }
      },
      comments: {
        include: {
          user: userInventoryIncludes.user,
          replies: {
            include: {
              user: userInventoryIncludes.user
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const postsWithCounts = await Promise.all(posts.map(async (post) => {
    const replyCount = post.comments.length + post.comments.reduce((total, comment) => total + comment.replies.length, 0);
    const allCommentsAndReplies = post.comments.concat(
      post.comments.flatMap(comment => comment.replies.map(reply => ({
        ...reply,
        user: {...comment.user, inventory: comment.user.inventory,},
        replies: []
      })))
    );
    const lastCommentOrReply = allCommentsAndReplies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const replies = post.comments.flatMap(comment => comment.replies);
    return { ...post, replyCount, lastCommentOrReply, replies };
  }));

  const postsCount = await prisma.post.count({
    where: whereClause,
  });

  return { posts: postsWithCounts, count: postsCount };

}, z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
  tags: z.array(z.string()).optional(),
  categorySlug: z.string().optional()
}),
{ authed: false })

export const createPost = createAction(async ({ session }, { title, body, category, tags, broadcast }) => {
  
  
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
    tags.map(async (tagSlug) => {
      tagSlug = tagSlug.trim().replace(/^#/, '') // Trim whitespace

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
      broadcast: broadcast ? {
        create: {
          status: "PENDING"
        }
      } : undefined
    }
  })

  if(post.title === "") {
    await prisma.post.update({
      where: {
        id: post.id
      },
      data: {
        title: post.id,
        slug: post.id
      }
    })
  }

  if(broadcast) {
    const users = await prisma.user.findMany({})

    for(const user of users) {
      await sendEmail.queue.add('sendEmail', {email: user.email, subject: post.title, template:post.body})

      await prisma.broadcast.update({
        where: {
          postId: post.id
        },
        data: {
          sentTo: {
            connect: {
              id: user.id
            }
          }
        }
      })
    }

    await prisma.broadcast.update({
      where: {
        postId: post.id
      },
      data: {
        status: "SENT"
      }
    })
  }


  await triggerAction({ title: "CREATE_POST" })
  revalidatePath('/feed')
  return post

}, PostSchema, { authed: true })

export const getSinglePost = createAction(async ({ }, { slug }) => {
  const post = await prisma.post.findFirst({
    where: {
      slug: slug
    },
    include: {
      user: userInventoryIncludes.user,
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
    data.tags.map(async (tagSlug) => {
      tagSlug = tagSlug.trim().replace(/^#/, '') // Trim whitespace

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
  const { broadcast, ...updateData } = data;
  const post = await prisma.post.update({
    where: {
      slug
    },
    data: {
      ...updateData,
      slug: newSlug,
      category: {
        connect: {
          slug: data.category
        }
      },
      tags: mappedTags
    }
  })
  revalidatePath('/')
  revalidatePath('/posts')
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



