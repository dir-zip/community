import { createAction } from "~/lib/createAction"
import { prisma } from "packages/db"
import {z} from 'zod'

export const getComment = createAction(async({}, {commentId}) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId
    },
    include: {
      replies: {
        include: {
          user: true
        }
      },
      parent: {
        include: {
          user: true
        }
      },
      user: true,
      post: {
        include: {
          user: true
        }
      }
    }
  })

  if (!comment) {
    throw new Error('Comment not found');
  }

  const replyCount = await prisma.comment.count({
    where: {
      parentId: comment.id
    }
  });

  // Add user and replyCount to each reply
  const repliesWithUserAndReplyCount = await Promise.all(comment.replies.map(async (reply) => {
    const replyCount = await prisma.comment.count({
      where: {
        parentId: reply.id
      }
    });

    return { ...reply, replyCount };
  }));

  return { ...comment, replyCount, replies: repliesWithUserAndReplyCount };
}, z.object({
  commentId: z.string()
}))


export const getCommentsForPost = createAction(async({}, {postSlug}) => {
  let postId;

  const getPost = await prisma.post.findFirst({
    where: {
      slug: postSlug
    }
  })

  if (getPost) {
    postId = getPost.id;
  }

  // If no post was found, try to find a comment with the given id
  if (!postId) {
    const comment = await prisma.comment.findFirst({
      where: {
        id: postSlug
      }
    })

    if (comment) {
      postId = comment.postId;
    }
  }

  // If neither a post nor a comment was found, throw an error
  if (!postId) {
    throw new Error('Post or Comment not found');
  }

  const comments = await prisma.comment.findMany({
    where: {
      AND: [
        { parentId: null },
        { postId: postId }
      ]
    },
    include: {
      user: true
    }
  })

  // Add count of replies and user to each comment
  const commentsWithReplyCountAndUser = await Promise.all(comments.map(async (comment) => {
    const replyCount = await prisma.comment.count({
      where: {
        parentId: comment.id
      }
    });

    const replies = await prisma.comment.findMany({
      where: {
        parentId: comment.id
      },
      include: {
        user: true
      }
    });

    return { ...comment, replyCount, replies };
  }));

  return commentsWithReplyCountAndUser;
}, z.object({
  postSlug: z.string()
}))