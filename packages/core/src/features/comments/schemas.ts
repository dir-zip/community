import {z} from 'zod'
export const CommentSchema = z.object({
  body: z.string()
});