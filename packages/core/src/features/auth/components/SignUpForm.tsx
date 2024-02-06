"use client";

import { FORM_ERROR, Form, TextField } from "../../../components/Forms";
import { SignupSchema } from "../schemas";
import { signUpAction } from "../actions";
import { useRouter } from "next/navigation";

export default function SignUpForm({ nextUrl, inviteOnly }: { nextUrl: string, inviteOnly?: boolean }) {
  const router = useRouter();
  return (
    <Form
      submitText="Sign Up"
      schema={SignupSchema}
      onSubmit={async (data) => {
        try {
          await signUpAction({ email: data.email, username: data.username, password: data.password, confirm_password: data.confirm_password, inviteToken: data.inviteToken });
          router.push(nextUrl);
        } catch (err: any) {
          console.log(err);
          return { [FORM_ERROR]: err.toString() };
        }
      }}
    >
      {inviteOnly && <TextField label="Invite Token" name="inviteToken" type="text" />}
      <TextField label="Email" name="email" type="text" />
      <TextField label="Username" name="username" type="text" />
      <TextField label="Password" name="password" type="password" />
      <TextField
        label="Confirm Password"
        name="confirm_password"
        type="password"
      />
     
    </Form>
  );
}
