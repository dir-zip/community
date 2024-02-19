"use server"

import {
  PasswordHandler,
  generateToken,
  COOKIE_SESSION_TOKEN,
  COOKIE_CSRF_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  CrudTypesArray,
  type Provider,
  AuthInit,
} from "@dir/auth"

import { prisma } from "@dir/db"
import { db, schema } from "@dir/db"
import { eq, and } from "drizzle-orm"

import sendEmail from "../../jobs/sendEmail"
import { cookies } from "next/headers"

import { z } from "zod"
import {
  ResetPasswordSchema,
  ForgotPasswordSchema,
  SignupSchema,
  LoginSchema,
} from "./schemas"

import { createAction } from "../../lib/createAction"
import { BaseSessionData, type BaseRole } from "../../index"
import { cache } from "react"
import { authInit } from "../../lib/auth"
import authDriver from "../../authDriver"
import { guards } from "../../guards"
import { redirect } from "next/navigation"
import { userInventoryIncludes } from "~/lib/includes"

export const loginAction = createAction(
  async ({ createSession }, { email, password }) => {
    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    })

    if (!user) {
      throw new Error("No user found")
    }

    const verifyPassword = await PasswordHandler.verify(
      password,
      user.hashedPassword!
    )

    if (!verifyPassword) {
      throw new Error("Invalid password")
    }

    await createSession({
      userId: user.id,
      role: user.role as BaseRole,
      email: user.email,
      verified: user.verified,
    })

    return user
  },
  LoginSchema,
  { authed: false }
)

export const checkActions = createAction(
  async () => {
    const result1 = await db.query.action.findMany({
      // with: {
      //   posts: true
      // },
    })
    console.log(result1)
  },
  SignupSchema,
  { authed: false }
)

export const signUpAction = createAction(
  async ({ createSession }, { email, password, username, inviteToken }) => {
    const signupFlow = await db.query.featureToggle.findFirst({
      where: (feature, { eq }) => eq(feature.feature, "signupFlow"),
    })
    console.log("signupFlow")
    console.log(signupFlow)

    const isInviteOnly = signupFlow?.value === "invite"

    // Check if signup is invite-only and inviteToken is provided
    if (isInviteOnly && !inviteToken) {
      throw new Error("An invite token is required for signup.")
    }

    // If invite only, verify the invite token
    if (isInviteOnly) {
      const hashedToken = await PasswordHandler.hash(inviteToken as string)
      const foundToken = await db.query.token.findFirst({
        where: (token, { eq, and }) =>
          and(
            eq(token.hashedToken, hashedToken),
            eq(token.type, "INVITE_TOKEN")
          ),
      })

      if (!foundToken) {
        throw new Error("Invalid token")
      }

      await db.delete(schema.token).where(eq(schema.token.id, foundToken.id))

      if (foundToken.expiresAt < new Date()) {
        throw new Error("Token expired")
      }
    }

    const hashedPassword = await PasswordHandler.hash(password)

    const user = await db
      .insert(schema.user)
      .values({
        email,
        username,
        hashedPassword: hashedPassword,
      })
      .returning()
    const generalList = await db.query.list.findFirst({
      where: (list, { eq }) => eq(list.slug, "general"),
    })
    if (generalList) {
      await db
        .insert(schema.userList)
        .values({
          listId: generalList.id,
          userId: user.id,
        })
        .execute()
    }

    await db.insert(schema.inventory).values({
      userId: user.id,
    })

    await db
      .delete(schema.token)
      .where(
        and(
          eq(schema.token.type, "ACTIVATE_TOKEN"),
          eq(schema.token.userId, user.id)
        )
      )
    const token = generateToken(32)
    const hashedToken = await PasswordHandler.hash(token)
    await db.insert(schema.token).values({
      type: "ACTIVATE_TOKEN",
      userId: user.id,
      sentTo: user.email,
      hashedToken: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toString(),
    })

    const activateUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/activateAccount?token=${token}`
    await sendEmail.queue.add("sendEmail", {
      type: "ACTIVATE_ACCOUNT",
      email,
      url: activateUrl,
    })

    await createSession({
      userId: user.id,
      role: "USER",
      email: user.email,
      verified: false,
    })
  },
  SignupSchema,
  { authed: false }
)

export const verifyUser = createAction(
  async ({ session, updateSession }, { token }) => {
    const user = await db.query.user.findFirst({
      // TODO
      where: ({ id }, { eq }) => eq(id, session?.data.userId),
    })

    if (!user) {
      throw new Error("User not found")
    }

    const hashedToken = await PasswordHandler.hash(token)
    const foundToken = await db.query.token.findFirst({
      where: (token, { eq, and }) =>
        and(
          eq(token.hashedToken, hashedToken),
          eq(token.type, "ACTIVATE_TOKEN")
        ),
      with: {
        user: true,
      },
    })

    if (!foundToken) {
      throw new Error("Invalid token")
    }

    await db.delete(schema.token).where(eq(schema.token.id, foundToken.id))

    if (foundToken.expiresAt < new Date()) {
      throw new Error("Token expired")
    }

    await db
      .update(schema.user)
      .set({
        verified: true,
      })
      .where(eq(schema.user.id, user.id))

    await updateSession({
      verified: true,
    })
  },
  z.object({
    token: z.string(),
  })
)

export const getCurrentUser = cache(
  createAction(async ({ session }) => {
    const userId = session?.data.userId
    const globalSettings = await db.query.globalSetting.findFirst({
      with: {
        features: true,
      },
    })
    const isSitePrivate = globalSettings?.features.some(
      (feature) => feature.feature === "private" && feature.isActive
    )

    if (!userId && !isSitePrivate) {
      return null // Return null if there is no session and the site is not private
    }

    if (!userId) {
      throw new Error("No user id")
    }

    const user = await db.query.user.findFirst({
      where: ({ id }, { eq }) => eq(id, userId),
      with: {
        // TODO
        // inventory: userInventoryIncludes.user.include.inventory,
      },
    })

    if (!user) {
      throw new Error("Cannot find user")
    }

    return user
  })
)

export const logoutAction = createAction(async ({ deleteSession }) => {
  await deleteSession()

  cookies().delete(COOKIE_SESSION_TOKEN)
  cookies().delete(COOKIE_CSRF_TOKEN)
  cookies().delete(COOKIE_PUBLIC_DATA_TOKEN)

  redirect("/login")
})

export const checkGuard = createAction(
  async ({ auth }, { rule }) => {
    const can = await auth.validate([rule[0], rule[1], rule[2]], {
      throw: false,
    })
    return can!
  },
  z.object({
    rule: z.tuple([z.enum(CrudTypesArray), z.string()]).rest(z.any()),
  })
)

export const forgotPasswordAction = createAction(
  async ({}, { email }) => {
    const user = await db.query.user.findFirst({
      where: (user) => eq(user.email, email),
    })

    if (user) {
      await db
        .delete(schema.token)
        .where(
          and(
            eq(schema.token.type, "RESET_PASSWORD"),
            eq(schema.token.userId, user.id)
          )
        )
      const token = generateToken(32)
      const hashedToken = await PasswordHandler.hash(token)
      await db.insert(schema.token).values({
        type: "RESET_PASSWORD",
        userId: user.id,
        sentTo: user.email,
        hashedToken: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toString(),
      })

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      await sendEmail.queue.add("sendEmail", {
        type: "FORGOT_PASSWORD",
        email,
        url: resetUrl,
      })
    } else {
      await new Promise((resolve) => setTimeout(resolve, 700))
    }

    return
  },
  ForgotPasswordSchema,
  { authed: false }
)

export const resetPasswordAction = createAction(
  async ({ createSession }, { token, password }) => {
    if (!token) {
      throw new Error("Invalid token")
    }

    const hashedToken = await PasswordHandler.hash(token)
    const foundToken = await db.query.token.findFirst({
      where: (token, { eq, and }) =>
        and(
          eq(token.hashedToken, hashedToken),
          eq(token.type, "RESET_PASSWORD")
        ),
      with: { user: true },
    })

    if (!foundToken) {
      throw new Error("Invalid token")
    }

    await db.delete(schema.token).where(eq(schema.token.id, foundToken.id))

    // TODO
    if (foundToken.expiresAt < new Date()) {
      throw new Error("Token expired")
    }

    const hashedPassword = await PasswordHandler.hash(password)
    const user = await db
      .update(schema.user)
      .set({
        hashedPassword,
      })
      .where(eq(schema.user.id, foundToken.userId))

    await db.delete(schema.session).where(eq(schema.session.userId, user.id))

    await createSession({
      userId: user.id,
      role: user.role as BaseRole,
      email: user.email,
      verified: user.verified,
    })

    return user
  },
  ResetPasswordSchema,
  { authed: false }
)

// OAUTH STUFF

export const handleOauth = async ({
  email,
  auth,
}: {
  email: string
  auth: AuthInit<BaseSessionData>
}) => {
  const foundUser = await db.query.user.findFirst({
    where: (user) => eq(user.email, email),
  })

  if (foundUser) {
    const data = {
      userId: foundUser.id,
      role: foundUser.role as BaseRole,
      email: foundUser.email,
      verified: true,
    }

    await auth.createSession(data)

    return foundUser
  }

  if (!foundUser) {
    const user = await db
      .insert(schema.user)
      .values({
        email,
        username: email,
        role: "USER",
        // TODO: connect list
        // lists: {
        //   connect: {
        //     slug: "general",
        //   },
        // },
      })
      .returning()
    // const user = await prisma.user.create({
    //   data: {
    //     email,
    //     username: email,
    //     role: "USER",
    //     lists: {
    //       connect: {
    //         slug: "general",
    //       },
    //     },
    //   },
    // })

    await auth.createSession({
      userId: user.id,
      role: user.role as BaseRole,
      email: user.email,
      verified: true,
    })

    /** This is because we call the createWorkspace function after creating the user.
     * The original user "const" doesn't have any workspace on it yet.
     * So we make a db call to get the updated version.  */
    const getNewUser = await db.query.user.findFirst({
      where: ({ id }, { eq }) => eq(id, user.id),
    })

    return getNewUser
  }
}

export const OAuthUrl = async ({
  provider,
  oauth,
}: {
  provider: Provider
  oauth: {
    providers: {
      github: {
        clientId: string
        clientSecret: string
      }
      google: {
        clientId: string
        clientSecret: string
      }
    }
    baseUrl: string
  }
}) => {
  const auth = authInit({ driver: authDriver, guards: guards, oauth })
  const url = await auth.getOAuthUrl(provider)
  return url
}
