import {z} from 'zod'

export const PasswordSchema = z.string().min(8).transform((value) => value.trim())

export const SignupSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  password: PasswordSchema,
  confirm_password: PasswordSchema,
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email()
})

export const ResetPasswordSchema = z.object({
  token: z.string().optional(),
  password: PasswordSchema,
  confirm_password: PasswordSchema,
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const UpdateUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
})