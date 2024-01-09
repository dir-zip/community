"use client";

import { FORM_ERROR, Form, TextField } from "../../../components/Forms";
import { ResetPasswordSchema } from "../schemas";
import { resetPasswordAction } from "../actions";
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  return (
    <>
      <Form submitText="Submit" schema={ResetPasswordSchema} onSubmit={async (data) => {
        try {
          await resetPasswordAction({
            password: data.password,
            token: params.get('token')!,
            confirm_password: data.confirm_password
          });
          router.push('/')
        } catch (err: any) {
          console.log(err)
          return { [FORM_ERROR]: err.toString() }
        }
      }}>
        <TextField label="Password" name="password" type="password" />
        <TextField label="Confirm Password" name="confirm_password" type="password" />
      </Form>
    </>
  );
}
