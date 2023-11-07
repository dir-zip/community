"use client";

import { FORM_ERROR, Form, TextField } from "@/components/Forms";
import { ForgotPasswordSchema } from "../schemas";
import Link from "../../../components/ui/Link";
import {forgotPasswordAction} from '../actions'


export default function ForgotPasswordForm() {

  return (
    <>
      <Form submitText="Send reset instructions" schema={ForgotPasswordSchema} onSubmit={async (data) => {
        try {
          await forgotPasswordAction({
            email: data.email
          });
        } catch(err: any) {
          console.log(err)
          return {[FORM_ERROR]: err.toString()}
        }
      }}>
        <TextField label="Email" name="email" type="text" />
        <p className="text-right text-sm text-muted-foreground">
          <Link
            href="/login"
          >
            Go back to login
          </Link>
        </p>
      </Form>
    </>
  );
}
