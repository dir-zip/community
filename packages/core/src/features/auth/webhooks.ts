import { BaseSessionData } from "@/index";
import { authInit } from "../../lib/auth";
import { type NextRequest } from "next/server";
import { handleOauth, verifyUser } from "./actions";
import { AuthInit } from "packages/auth";

export async function OAuthLogin<T>(request: NextRequest, type: string, auth: AuthInit<T & BaseSessionData>) {
  const email = await auth.getOAuthEmail({code: request.nextUrl.searchParams.get("code") || '', callback: [type]})
  await handleOauth({email, auth: auth as unknown as AuthInit<BaseSessionData>})


  return Response.redirect(process.env.NEXT_PUBLIC_APP_URL as string);
}

export async function VerifyUser(request: NextRequest) {

  await verifyUser({token: request.nextUrl.searchParams.get('token') || ''})

  return Response.redirect(process.env.NEXT_PUBLIC_APP_URL as string)
}