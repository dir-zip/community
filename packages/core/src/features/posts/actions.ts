'use server'
import { JSDOM } from 'jsdom';
import { and, count, db, eq, inArray, like, not } from "@dir/db";
import { z } from "zod";
import { createAction } from '~/lib/createAction';
import { PostSchema } from "~/features/posts/schemas";
import { findFreeSlug } from "@/utils";
import { revalidatePath } from 'next/cache'
import { prepareArrayField } from "@creatorsneverdie/prepare-array-for-prisma"
import { triggerAction } from '../actions/actions';
import { sendEmail } from "~/jobs";
import { broadcast, category, comment, listBroadcast, post, postTags, tag, userBroadcast } from 'packages/db/drizzle/schema';
import { UserWithInventory } from '~/lib/types';

export const getCategories = createAction(async () => {
  const categories = await db.query.category.findMany()
  return categories
})

export const getAllPosts = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { skip, take, tags, categorySlug, title } = params;

  // FIXME: Remove this block as needed
  // let whereClause: {
  //   tags?: {
  //     some?: { slug: { in: string[], not?: string } },
  //     none?: { slug: string }
  //   },
  //   category?: {
  //     slug?: string
  //   },
  //   title?: {
  //     contains: string
  //   }
  // } = {};

  // if (tags && tags.length > 0) {
  //   whereClause.tags = {
  //     some: {
  //       slug: {
  //         in: tags,
  //         not: 'feed'
  //       }
  //     }
  //   };
  // } else {
  //   whereClause.tags = {
  //     none: {
  //       slug: 'feed'
  //     }
  //   };
  // }

  // if (categorySlug && categorySlug !== "all") {
  //   whereClause.category = {
  //     slug: categorySlug
  //   };
  // }

  // if (title) { // Add this block
  //   whereClause.title = {
  //     contains: title
  //   };
  // }

  // FIXME: Remove this block as needed
  // const broadcastPinFeature = await prisma.featureToggle.findUnique({
  //   where: {
  //     feature: 'broadcastPin'
  //   },
  // });
  const broadcastPinFeature = await db.query.featureToggle.findFirst({
    where: (broadcast, { eq }) => eq(broadcast.feature, 'broadcastPin')
  })

  const PRIORITY_DAYS = Number(broadcastPinFeature?.value) || 0;
  const priorityDate = new Date();
  priorityDate.setDate(priorityDate.getDate() - PRIORITY_DAYS);

  // FIXME: Remove this block as needed
  // const posts = await prisma.post.findMany({
  //   skip,
  //   take,
  //   where: whereClause,
  //   include: {
  //     user: userInventoryIncludes.user,
  //     broadcasts: true,
  //     category: {
  //       select: {
  //         title: true,
  //         slug: true
  //       }
  //     },
  //     comments: {
  //       include: {
  //         user: userInventoryIncludes.user,
  //         replies: {
  //           include: {
  //             user: userInventoryIncludes.user
  //           }
  //         }
  //       },
  //       orderBy: {
  //         createdAt: 'desc'
  //       }
  //     }
  //   },
  //   orderBy: {
  //     createdAt: 'desc'
  //   }
  // });

  const categorySubquery = (categorySlug)
    ? await db.select().from(category).where(eq(category.slug, categorySlug))
    : undefined;

  const tagSubquery = (tags && tags.length > 0)
    ? await db.select().from(tag).where(and(inArray(tag.slug, tags), not(eq(tag.slug, 'feed'))))
    : await db.select().from(tag).where(not(eq(tag.slug, 'feed')))

  const postTagSubQuery = (tagSubquery.length > 0)
    ? await db.select().from(postTags).where(inArray(postTags.tagId, tagSubquery.map(item => item.id)))
    : undefined

  const posts = await db.query.post.findMany({
    with: {
      user: {
        with: {
          inventory: {
            with: {
              inventoryItems: {
                where: (items, { eq }) => eq(items.equipped, true),
                with: {
                  item: true
                }
              }
            }
          }
        }
      },
      broadcasts: true,
      category: {
        columns: { title: true, slug: true },
      },
      comments: {
        with: {
          user: {
            with: {
              inventory: {
                with: {
                  inventoryItems: {
                    where: (items, { eq }) => eq(items.equipped, true),
                    with: {
                      item: true
                    }
                  }
                }
              }
            }
          },
          replies: {
            with: {
              user: {
                with: {
                  inventory: {
                    with: {
                      inventoryItems: {
                        where: (items, { eq }) => eq(items.equipped, true),
                        with: {
                          item: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    where: (post, { and, like, inArray }) => and(
      title ? like(post.title, title) : undefined,
      (categorySlug !== "all" && categorySubquery && categorySubquery.length > 0) ? inArray(post.categoryId, categorySubquery.map(item => item.id)) : undefined,
      (postTagSubQuery && postTagSubQuery.length > 0) ? inArray(post.id, postTagSubQuery.map(item => item.id)) : undefined
    ),
    orderBy: (post, { desc }) => [desc(post.createdAt)],
    limit: take,
    offset: skip
  })

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
      }
      )))
    );

    const lastCommentOrReply = allCommentsAndReplies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const replies = post.comments.flatMap(comment => comment.replies);

    return { ...post, replyCount, lastCommentOrReply, replies };
  }));

  // FIXME: Remove this block as needed
  // const postsCount = await prisma.post.count({
  //   where: whereClause,
  // });

  const postCountResult = await db.select({ count: count() })
    .from(post)
    .where(
      and(
        title ? like(post.title, title) : undefined,
        (categorySlug !== "all" && categorySubquery && categorySubquery.length > 0) ? inArray(post.categoryId, categorySubquery.map(item => item.id)) : undefined,
        (postTagSubQuery && postTagSubQuery.length > 0) ? inArray(post.id, postTagSubQuery.map(item => item.id)) : undefined
      )
    );

  const postsCount: number = postCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

  return { posts: postsWithCounts, count: postsCount };

}, z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
  tags: z.array(z.string()).optional(),
  categorySlug: z.string().optional(),
  title: z.string().optional()
}),
  { authed: false })

export const createPost = createAction(async ({ session }, data) => {
  let { title, body, category, tags, broadcastToList } = data
  let generatedTitle: string = title

  if (title === "") {
    const dom = new JSDOM(body);
    const h1 = dom.window.document.querySelector('h1');
    const p = dom.window.document.querySelector('p');
    generatedTitle = h1 ? h1.textContent as string : (p ? p.textContent as string : 'Default Title');
  }

  const createSlug = await findFreeSlug(
    title !== "" ? title.toLowerCase().replace(/[^a-z0-9]/g, "-") : generatedTitle.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    async (slug: string) =>
      // FIXME: Remove this block as needed
      // await prisma.post.findUnique({ where: { slug } })
      await db.query.post.findFirst({ where: (post, { eq }) => eq(post.slug, slug) })
  );

  // FIXME: Remove this block as needed
  // const getCategory = await prisma.category.findFirst({
  //   where: {
  //     slug: category
  //   }
  // })
  const getCategory = await db.query.category.findFirst({
    where: (cate, { eq }) => eq(cate.slug, category)
  })

  if (!getCategory) {
    throw new Error('No category found !');
  }

  const newTags = await Promise.all(
    tags.map(async (tagSlug) => {
      tagSlug = tagSlug.trim().replace(/^#/, '') // Trim whitespace

      if (!tagSlug) return null; // Skip empty strings

      // Check if the tag already exists
      // FIXME: Remove this block as needed
      // const existingTag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      const existingTag = await db.query.tag.findFirst({
        where: (tag, { eq }) => eq(tag.slug, tagSlug)
      });

      if (existingTag) {
        // If the tag exists, return it to connect to it
        return { id: existingTag.id };
      } else {
        // If the tag doesn't exist, generate a new slug and create a new tag
        const updatedTagSlug = await findFreeSlug(
          tagSlug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          async (slug: string) =>
            // FIXME: Remove this block as needed
            // await prisma.tag.findUnique({ where: { slug } }),
            await db.query.tag.findFirst({ where: (tag, { eq }) => eq(tag.slug, slug) })
        );

        return { title: tagSlug, slug: updatedTagSlug };
      }
    })
  );

  const filteredTags = newTags.filter(Boolean);

  const mappedTags = prepareArrayField(
    filteredTags.map((c) => {
      return c
    })
  )

  // FIXME: Remove this block as needed
  // const post = await prisma.post.create({
  //   data: {
  //     title: generatedTitle,
  //     body,
  //     slug: createSlug,
  //     categoryId: getCategory?.id!,
  //     userId: session?.data.userId!,
  //     tags: prepareArrayField(
  //       filteredTags.map((c) => {
  //         return c
  //       })
  //     )
  //   }
  // })

  const createdPosts = await db.insert(post)
    .values({
      title: generatedTitle,
      body,
      slug: createSlug,
      categoryId: getCategory?.id!,
      userId: session?.data.userId!
    })
    .returning();

  const createdPost = createdPosts[0];
  if (!createdPost) {
    throw new Error('Create new post failed !')
  }

  if (mappedTags.create) {
    const newTagItems = await db.insert(tag).values(mappedTags.create).returning();
    const insertData = newTagItems.map((item) => ({ tagId: item.id, postId: createdPost.id }))
    await db.insert(postTags).values(insertData)
  }

  if (data.broadcast) {
    // FIXME: Remove this block as needed
    // const unsubscribedList = await prisma.list.findUnique({
    //   where: {
    //     slug: 'unsubscribed'
    //   },
    //   include: {
    //     users: true
    //   }
    // });
    const unsubscribedList = await db.query.list.findFirst({
      where: (ls, { eq }) => eq(ls.slug, 'unsubscribed'),
      with: {
        users: true
      }
    })

    // Extract user IDs from the unsubscribed list
    const unsubscribedUserIds = unsubscribedList ? unsubscribedList.users.map(user => user.id) : [];

    // FIXME: Remove this block as needed
    // const targetLists = await prisma.list.findMany({
    //   where: {
    //     slug: {
    //       in: broadcastToList
    //     }
    //   },
    //   include: {
    //     users: true
    //   }
    // });
    const targetLists = await db.query.list.findMany({
      where: (ls, { inArray }) => inArray(ls.slug, broadcastToList || []),
      with: {
        users: {
          with: {
            user: true
          }
        }
      }
    })

    // Initialize a set to keep track of user IDs that have already been processed
    const processedUserIds = new Set();

    for (const list of targetLists) {
      for (const userWithList of list.users) {
        const user = userWithList.user;

        if (!unsubscribedUserIds.includes(user.id) && !processedUserIds.has(user.id)) {
          await sendEmail.queue.add(
            'sendEmail',
            {
              type: "BROADCAST",
              email: user.email,
              subject: createdPost.title,
              html: createdPost.body
            }
          );

          // Create a broadcast and connect it to the current list
          // FIXME: Remove this block as needed
          // await prisma.broadcast.create({
          //   data: {
          //     lists: {
          //       connect: {
          //         id: list.id
          //       }
          //     },
          //     users: {
          //       connect: {
          //         id: user.id
          //       }
          //     },
          //     post: {
          //       connect: {
          //         id: post.id
          //       }
          //     },
          //     status: "SENT"
          //   }
          // });

          const newBroadcasts = await db.insert(broadcast)
            .values({
              status: "SENT",
              postId: createdPost.id,
            })
            .returning();

          const newBroadcast = newBroadcasts[0];
          if (newBroadcast) {
            await db.insert(listBroadcast).values({ listId: list.id, broadcastId: newBroadcast.id });
            await db.insert(userBroadcast).values({ userId: user.id, broadcastId: newBroadcast.id });
          }

          // Mark the user as processed
          processedUserIds.add(user.id);

        }
      }

    }
  }

  await triggerAction({ title: "CREATE_POST" })
  revalidatePath('/feed')
  return createdPost

}, PostSchema, { authed: true })

export const getSinglePost = createAction(async ({ }, { slug }) => {
  // FIXME: Remove this block as needed
  // const post = await prisma.post.findFirst({
  //   where: {
  //     slug: slug
  //   },
  //   include: {
  //     user: userInventoryIncludes.user,
  //     category: true,
  //     tags: true
  //   }
  // })
  const postResult = await db.query.post.findFirst({
    where: (post, { eq }) => eq(post.slug, slug),
    with: {
      user: {
        with: {
          inventory: {
            with: {
              inventoryItems: {
                where: (items, { eq }) => eq(items.equipped, true),
                with: {
                  item: true
                }
              }
            }
          }
        }
      },
      category: true,
      tags: {
        with: {
          tag: true
        }
      }
    }
  })

  return postResult
}, z.object({
  slug: z.string()
}))

export const updatePost = createAction(async ({ validate, session }, { slug, data }) => {
  await validate(['UPDATE', "post", slug]);

  // FIXME: Remove this block as needed
  // const currentPost = await prisma.post.findUnique({ where: { slug }, include: { tags: true } });
  const currentPost = await db.query.post.findFirst({
    where: (post, { eq }) => eq(post.slug, slug),
    with: { tags: true }
  })

  let newSlug;
  if (currentPost?.title !== data.title) {
    newSlug = await findFreeSlug(
      data.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      async (slug: string) =>
        // FIXME: Remove this block as needed
        // await prisma.post.findUnique({ where: { slug } }),
        await db.query.post.findFirst({ where: (post, { eq }) => eq(post.slug, slug) })
    );
  } else {
    newSlug = currentPost.slug;
  }

  const newTags = await Promise.all(
    data.tags.map(async (tagSlug) => {
      tagSlug = tagSlug.trim().replace(/^#/, '') // Trim whitespace

      if (!tagSlug) return null; // Skip empty strings

      // Check if the tag already exists
      // FIXME: Remove this block as needed
      // const existingTag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      const existingTag = await db.query.tag.findFirst({
        where: (tag, { eq }) => eq(tag.slug, tagSlug)
      });

      if (existingTag) {
        // If the tag exists, return it to connect to it
        return { id: existingTag.id };
      } else {
        // If the tag doesn't exist, generate a new slug and create a new tag
        const updatedTagSlug = await findFreeSlug(
          tagSlug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          async (slug: string) =>
            // FIXME: Remove this block as needed
            // await prisma.tag.findUnique({ where: { slug } }),
            await db.query.tag.findFirst({ where: (tag, { eq }) => eq(tag.slug, slug) })
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

  // FIXME: Remove this block as needed
  // const post = await prisma.post.update({
  //   where: {
  //     slug
  //   },
  //   data: {
  //     ...updateData,
  //     slug: newSlug,
  //     category: {
  //       connect: {
  //         slug: data.category
  //       }
  //     },
  //     tags: mappedTags
  //   }
  // })

  const categoryResult = await db.query.category.findFirst({ where: (cate, { eq }) => eq(cate.slug, data.category) });
  const updatedPosts = await db.update(post)
    .set({
      title: updateData.title,
      body: updateData.body,
      categoryId: categoryResult?.id,
      slug: newSlug 
    })
    .where(eq(post.slug, slug))
    .returning();

  const updatedPost = updatedPosts[0];
  if (mappedTags.create && updatedPost) {
    const newTagItems = await db.insert(tag).values(mappedTags.create).returning();
    const insertData = newTagItems.map((item) => ({ tagId: item.id, postId: updatedPost.id }))
    await db.insert(postTags).values(insertData)
  }

  if (mappedTags.update && updatedPost) {
    await Promise.all(mappedTags.update.map(async (item) => {
      await db.update(tag).set(item.data).where(eq(tag.id, item.where.id))
    }))
  }

  revalidatePath('/');
  revalidatePath('/posts');

  return updatedPost
}, z.object({
  slug: z.string(),
  data: PostSchema
}), { authed: true })

export const createComment = createAction(async ({ session }, { postSlug, body, parentId }) => {
  // FIXME: Remove this block as needed
  // const post = await prisma.post.findFirst({
  //   where: {
  //     slug: postSlug
  //   }
  // })
  const postResult = await db.query.post.findFirst({
    where: (post, { eq }) => eq(post.slug, postSlug)
  });

  // FIXME: Remove this block as needed
  // const comment = await prisma.comment.create({
  //   data: {
  //     postId: post!.id,
  //     userId: session?.data.userId!,
  //     body,
  //     parentId: parentId || null
  //   }
  // })
  const createdComments = await db.insert(comment)
    .values({
      postId: postResult!.id,
      userId: session?.data.userId!,
      body,
      parentId: parentId || null
    })
    .returning();

  await triggerAction({ title: "CREATE_COMMENT" })
  revalidatePath('/posts/[slug]')

  const cmt = createdComments[0];
  return cmt;
}, z.object({
  postSlug: z.string(),
  parentId: z.string().nullable(),
  body: z.string()
}), { authed: true })
