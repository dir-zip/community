"use client"

import { Form, TextField } from "apps/web/components/Forms"
import {loginAction} from "apps/web/app/auth/actions"
import {useRouter} from 'next/navigation'

export const LoginForm = () => {
  const router = useRouter()
  return (
    <div>
      <Form onSubmit={async (data) => {
        const user = await loginAction(data)
        router.push(`/`)
      }} submitText="Login">
        <TextField name="email" type="email" label="Email" />
        <TextField name="password" type="password" label="Password" />
      </Form>
    </div>
  )
}