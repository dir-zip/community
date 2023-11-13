import { createAction } from "@/lib/createAction"
import { prisma } from "packages/db"
import {z} from 'zod'

export const getComment = createAction(async({}, {commentId}) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId
    },
    include: {
      replies: true,
      parent: true,
      user: true
    }
  })


  return comment
}, z.object({
  commentId: z.string()
}))


export const getCommentsForPost = createAction(async({}, {postSlug}) => {
  const getPost = await prisma.post.findFirst({
    where: {
      slug: postSlug
    }
  })
  const comments = await prisma.comment.findMany({
    where: {
      AND: [
        { parentId: null },
        { postId: getPost!.id }
      ]
    },
    include: {
      user: true
    }
  })

  return comments
}, z.object({
  postSlug: z.string()
}))