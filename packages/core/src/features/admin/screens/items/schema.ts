import {z} from 'zod'

export const CreateItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number()
})