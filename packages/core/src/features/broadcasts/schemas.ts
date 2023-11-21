import {z} from 'zod'

export const CreateBroadcastSchema = z.object({
  title: z.string(),
  body: z.string(),
  tags: z.string()
})