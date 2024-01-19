import {z} from 'zod'


export const PostSchema = z.object({
  title: z.string(),
  body: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
});

export const CategorySchema = z.object({
  title: z.string(),
});






