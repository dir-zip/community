import {z} from 'zod'

export const CreateActionSchema = z.object({
  title: z.string(),
  value: z.number()
})