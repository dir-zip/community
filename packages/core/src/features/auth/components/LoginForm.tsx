"use client";

import { FORM_ERROR, Form, TextField } from "@/components/Forms";
import { LoginSchema } from "../schemas";
import { OAuthUrl, loginAction } from "../actions";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";



export default function LoginForm({oauthDetails}: {oauthDetails: {
  providers: {
      github: {
          clientId: string;
          clientSecret: string;
      };
      google: {
          clientId: string;
          clientSecret: string;
      };
  };
  baseUrl: string;
}}) {
  const router = useRouter();
  return (
    <>
      <div className="border-b py-4 flex space-x-4 justify-center">
        <Button onClick={async (e) => {
          e.preventDefault()
          const url = await OAuthUrl({provider: "github", oauth: oauthDetails});
          router.push(url);
        }}>Github</Button>
        <Button onClick={async (e) => {
          e.preventDefault()
          const url = await OAuthUrl({provider: "google", oauth: oauthDetails});
          router.push(url);
        }}>Google</Button>
      </div>

      <Form
        submitText="Login"
        schema={LoginSchema}
        onSubmit={async (data) => {
          try {
            await loginAction({ email: data.email, password: data.password });
            router.push("/");
          } catch (err: any) {
            console.log(err);
            return { [FORM_ERROR]: err.toString() };
          }
        }}
      >
        <TextField label="Email" name="email" type="text" />
        <TextField label="Password" name="password" type="password" />
      </Form>
    </>
  );
}
