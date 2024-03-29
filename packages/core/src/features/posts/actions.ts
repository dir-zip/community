'use server'
import { JSDOM } from 'jsdom';
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

export const getAllPosts = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { skip, take, tags, categorySlug, title } = params;

  let whereClause: {
    tags?: {
      some?: { slug: { in: string[], not?: string } },
      none?: { slug: string }
    },
    category?: {
      slug?: string
    },
    title?: {
      contains: string
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

  if (title) { // Add this block
    whereClause.title = {
      contains: title
    };
  }

  const broadcastPinFeature = await prisma.featureToggle.findUnique({
    where: {
      feature: 'broadcastPin'
    },
  });

  const PRIORITY_DAYS = Number(broadcastPinFeature?.value) || 0;
  const priorityDate = new Date();
  priorityDate.setDate(priorityDate.getDate() - PRIORITY_DAYS);

  const posts = await prisma.post.findMany({
    skip,
    take,
    where: whereClause,
    include: {
      user: userInventoryIncludes.user,
      broadcasts: true,
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

  const sortedPosts = posts.sort((a, b) => {
    const aIsRecentBroadcast = a.broadcasts.length > 0 && a.createdAt > priorityDate ? 1 : 0;
    const bIsRecentBroadcast = b.broadcasts.length > 0 && b.createdAt > priorityDate ? 1 : 0;
    return bIsRecentBroadcast - aIsRecentBroadcast || b.createdAt.getTime() - a.createdAt.getTime();
  });

  const postsWithCounts = await Promise.all(sortedPosts.map(async (post) => {
    const replyCount = post.comments.length + post.comments.reduce((total, comment) => total + comment.replies.length, 0);
    const allCommentsAndReplies = post.comments.concat(
      post.comments.flatMap(comment => comment.replies.map(reply => ({
        ...reply,
        user: { ...comment.user, inventory: comment.user.inventory, },
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
  categorySlug: z.string().optional(),
  title: z.string().optional()
}),
  { authed: false })

export const createPost = createAction(async ({ session }, { title, body, category, tags, broadcast, broadcastToList }) => {
  let generatedTitle: string = title
  
  if (title === "") {
    const dom = new JSDOM(body);
    const h1 = dom.window.document.querySelector('h1');
    const p = dom.window.document.querySelector('p');
    generatedTitle = h1 ? h1.textContent as string : (p ? p.textContent as string : 'Default Title');
  }

  const createSlug = await findFreeSlug<Post>(
    title !== "" ? title.toLowerCase().replace(/[^a-z0-9]/g, "-") : generatedTitle.toLowerCase().replace(/[^a-z0-9]/g, "-"),
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
      title: generatedTitle,
      body,
      slug: createSlug,
      categoryId: getCategory?.id!,
      userId: session?.data.userId!,
      tags: prepareArrayField(
        filteredTags.map((c) => {
          return c
        })
      )
    }
  })


  if (broadcast) {
    const unsubscribedList = await prisma.list.findUnique({
      where: {
        slug: 'unsubscribed'
      },
      include: {
        users: true
      }
    });

    // Extract user IDs from the unsubscribed list
    const unsubscribedUserIds = unsubscribedList ? unsubscribedList.users.map(user => user.id) : [];

    const targetLists = await prisma.list.findMany({
      where: {
        slug: {
          in: broadcastToList
        }
      },
      include: {
        users: true
      }
    });

    // Initialize a set to keep track of user IDs that have already been processed
    const processedUserIds = new Set();

    for (const list of targetLists) {
      for (const user of list.users) {
        if (!unsubscribedUserIds.includes(user.id) && !processedUserIds.has(user.id)) {
          await sendEmail.queue.add('sendEmail', { type:"BROADCAST", email: user.email, subject: post.title, html: post.body });
          // Create a broadcast and connect it to the current list
          await prisma.broadcast.create({
            data: {
              lists: {
                connect: {
                  id: list.id
                }
              },
              users: {
                connect: {
                  id: user.id
                }
              },
              post: {
                connect: {
                  id: post.id
                }
              },
              status: "SENT"
            }
          });
          // Mark the user as processed
          processedUserIds.add(user.id);

        }
      }


    }
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



