'use server'
import { createAction } from "~/lib/createAction"
import { count, db, eq } from "packages/db"
import { z } from 'zod'
import { revalidatePath } from "next/cache"
import { comment } from "packages/db/drizzle/schema"

export const getComment = createAction(async ({ }, { commentId }) => {
  // FIXME: Remove this block as needed
  // const comment = await prisma.comment.findFirst({
  //   where: {
  //     id: commentId
  //   },
  //   include: {
  //     replies: {
  //       include: {
  //         user: userInventoryIncludes.user
  //       },
  //       orderBy: {
  //         createdAt: 'desc'
  //       }
  //     },
  //     parent: {
  //       include: {
  //         user: userInventoryIncludes.user
  //       }
  //     },
  //     user: userInventoryIncludes.user,
  //     post: {
  //       include: {
  //         user: userInventoryIncludes.user
  //       }
  //     }

  //   }
  // })
  const cmt = await db.query.comment.findFirst({
    where: (cmts, { eq }) => eq(cmts.id, commentId),
    with: {
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
        },
        orderBy: (reps, { desc }) => [desc(reps.id)]
      },
      parent: {
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
      },
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
      post: {
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
  })

  if (!cmt) {
    throw new Error('Comment not found');
  }

  // FIXME: Remove this block as needed
  // const replyCount = await prisma.comment.count({
  //   where: {
  //     parentId: cmt.id
  //   }
  // });
  const replyCountResult = await db.select({ count: count() })
    .from(comment)
    .where(eq(comment.parentId, cmt.id))

  const replyCount: number = replyCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

  // Add user and replyCount to each reply
  const repliesWithUserAndReplyCount = await Promise.all(cmt.replies.map(async (reply) => {
    // FIXME: Remove this block as needed
    // const replyCount = await prisma.comment.count({
    //   where: {
    //     parentId: reply.id
    //   }
    // });
    const subReplyCountResult = await db.select({ count: count() })
      .from(comment)
      .where(eq(comment.parentId, reply.id))

    const subReplyCount: number = subReplyCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { ...reply, replyCount: subReplyCount };
  }));

  return { ...cmt, replyCount, replies: repliesWithUserAndReplyCount };
}, z.object({
  commentId: z.string()
}))


export const getCommentsForPost = createAction(async ({ }, { postSlug }) => {
  let postId: string | null = null;

  // FIXME: Remove this block as needed
  // const getPost = await prisma.post.findFirst({
  //   where: {
  //     slug: postSlug
  //   }
  // })
  const getPost = await db.query.post.findFirst({
    where: (posts, { eq }) => eq(posts.slug, postSlug)
  })

  if (getPost) {
    postId = getPost.id;
  }

  // If no post was found, try to find a comment with the given id
  if (!postId) {
    // FIXME: Remove this block as needed
    // const comment = await prisma.comment.findFirst({
    //   where: {
    //     id: postSlug
    //   }
    // })
    const comment = await db.query.comment.findFirst({
      where: (comments, { eq }) => eq(comments.id, postSlug)
    })

    if (comment) {
      postId = comment.postId;
    }
  }

  // If neither a post nor a comment was found, throw an error
  if (!postId) {
    throw new Error('Post or Comment not found');
  }

  // FIXME: Remove this block as needed
  // const comments = await prisma.comment.findMany({
  //   where: {
  //     AND: [
  //       { parentId: null },
  //       { postId: postId }
  //     ]
  //   },
  //   include: {
  //     user: userInventoryIncludes.user,
  //   },
  //   orderBy: {
  //     createdAt: 'desc'
  //   }
  // })
  const comments = await db.query.comment.findMany({
    where: (cmts, { and, eq, isNull }) => and(
      eq(cmts.postId, postId!),
      isNull(cmts.parentId)
    ),
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
    },
    orderBy: (cmts, { desc }) => [desc(cmts.createdAt)]
  })

  // Add count of replies and user to each comment
  const commentsWithReplyCountAndUser = await Promise.all(comments.map(async (cmt) => {
    // FIXME: Remove this block as needed
    // const replyCount = await prisma.comment.count({
    //   where: {
    //     parentId: comment.id
    //   }
    // });
    const replyCountResult = await db.select({ count: count() })
      .from(comment)
      .where(eq(comment.parentId, cmt.id))

    const replyCount: number = replyCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    // FIXME: Remove this block as needed
    // const replies = await prisma.comment.findMany({
    //   where: {
    //     parentId: comment.id
    //   },
    //   include: {
    //     user: userInventoryIncludes.user
    //   },
    //   orderBy: {
    //     createdAt: 'desc'
    //   }
    // });
    const replies = await db.query.comment.findMany({
      where: (reps, { eq }) => eq(reps.parentId, cmt.id),
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
      },
      orderBy: (reps, { desc }) => [desc(reps.createdAt)]
    })

    return { ...cmt, replyCount, replies };
  }));

  return commentsWithReplyCountAndUser;
}, z.object({
  postSlug: z.string()
}))


export const updateComment = createAction(async ({ validate, session }, { id, data }) => {
  await validate(['UPDATE', "comment", id])

  // FIXME: Remove this block as needed
  // const comment = await prisma.comment.update({
  //   where: {
  //     id: id
  //   },
  //   data: {
  //     ...data,
  //   }
  // })
  const createdComments = await db.update(comment)
    .set(data)
    .where(eq(comment.id, id))
    .returning()

  revalidatePath('/posts/:slug')

  const createComment = createdComments[0];
  return createComment
}, z.object({
  id: z.string(),
  data: z.object({
    body: z.string()
  })
}), { authed: true })