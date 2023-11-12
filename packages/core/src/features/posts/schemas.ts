import {z} from 'zod'
import type { Category, Post, Comment } from 'packages/db'

export const PostSchema = z.object({
  title: z.string(),
  body: z.string(),
  category: z.string(),
  tags: z.array(z.string()).optional()
});

export const CategorySchema = z.object({
  title: z.string(),
});

export const CommentSchema = z.object({
  body: z.string(),
});




