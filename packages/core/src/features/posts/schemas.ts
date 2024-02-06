import {z} from 'zod'


export const PostSchema = z.object({
  title: z.string(),
  body: z.string(),
  category: z.string(),
  broadcast: z.boolean().optional(),
  broadcastToList: z.array(z.string()).optional(),
  tags: z.array(z.string()),
});

export const CategorySchema = z.object({
  title: z.string(),
});






