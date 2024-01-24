import {z} from 'zod'

export const CreateBadgeSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  conditions: z.array(z.object({
    action: z.string(),
    quantity: z.number()
  }))
})

