import {z} from 'zod'
import type { Category, Post } from 'packages/db'

export const PostSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const CategorySchema = z.object({
  title: z.string(),
});



