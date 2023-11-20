import {z} from 'zod'

export const CreateBadgeSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  condition: z.array(z.string())
})