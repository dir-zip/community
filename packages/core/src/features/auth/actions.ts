"use server";

import {
  PasswordHandler,
  generateToken,
  COOKIE_SESSION_TOKEN,
  COOKIE_CSRF_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  CrudTypesArray,
  type Provider,
  AuthInit,
} from "@dir/auth";

import { and, db, eq } from "@dir/db";
import sendEmail from '../../jobs/sendEmail'
import { cookies } from "next/headers";

import { z } from "zod";
import {
  ResetPasswordSchema,
  ForgotPasswordSchema,
  SignupSchema,
  LoginSchema,
} from "./schemas";

import { createAction } from '../../lib/createAction';
import { BaseSessionData, type BaseRole } from '../../index';
import { cache } from "react";
import { authInit } from '../../lib/auth';
import authDriver from '../../authDriver';
import { guards } from '../../guards';
import { redirect } from 'next/navigation';
import { userInventoryIncludes } from "~/lib/includes";
import { inventory, list, session, token, user, userList } from "packages/db/drizzle/schema";

export const loginAction = createAction(async ({ createSession }, { email, password }) => {
  // FIXME: Remove this block as needed
  // const user = await prisma.user.findUnique({
  //   where: { email },
  // });
  const user = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, email)
  })

  if (!user) {
    throw new Error("No user found");
  }

  const verifyPassword = await PasswordHandler.verify(
    password,
    user.hashedPassword!,
  );

  if (!verifyPassword) {
    throw new Error("Invalid password");
  }

  await createSession({
    userId: user.id,
    role: user.role as BaseRole,
    email: user.email,
    verified: user.verified
  })

  return user
}, LoginSchema, { authed: false })

export const signUpAction = createAction(async ({ createSession }, { email, password, username, inviteToken }) => {
  // FIXME: Remove this block as needed
  // const signupFlow = await prisma.featureToggle.findFirst({
  //   where: {
  //     feature: 'signupFlow'
  //   }
  // })
  const signupFlow = await db.query.featureToggle.findFirst({
    where: (toggle, { eq }) => eq(toggle.feature, "signupFlow")
  })

  const isInviteOnly = signupFlow?.value === 'invite'

  // Check if signup is invite-only and inviteToken is provided
  if (isInviteOnly && !inviteToken) {
    throw new Error("An invite token is required for signup.");
  }

  // If invite only, verify the invite token
  if (isInviteOnly) {
    const hashedToken = await PasswordHandler.hash(inviteToken as string);

    // FIXME: Remove this block as needed
    // const foundToken = await prisma.token.findFirst({
    //   where: { hashedToken, type: "INVITE_TOKEN" }
    // });
    const foundToken = await db.query.token.findFirst({
      where: (tok, { and, eq }) => and(
        eq(tok.hashedToken, hashedToken),
        eq(tok.type, "INVITE_TOKEN"),
      )
    })

    if (!foundToken) {
      throw new Error("Invalid token");
    }

    // FIXME: Remove this block as needed
    // await prisma.token.delete({ where: { id: foundToken.id } });
    await db.delete(token).where(eq(token.id, foundToken.id))

    if (new Date(foundToken.expiresAt) < new Date()) {
      throw new Error("Token expired");
    }

  }


  const hashedPassword = await PasswordHandler.hash(password);

  // FIXME: Remove this block as needed
  // const user = await prisma.user.create({
  //   data: {
  //     email,
  //     username,
  //     hashedPassword: hashedPassword,
  //     lists: {
  //       connect: {
  //         slug: 'general'
  //       }
  //     }
  //   },
  // });

  const newLists = await db.insert(list)
    .values({ slug: 'general', title: '' })
    .returning()

  const newUsers = await db.insert(user)
    .values({ email, username, hashedPassword })
    .returning()

  const newList = newLists[0];
  const newUser = newUsers[0];
  if (!newList || !newUser) {
    throw new Error('Create new record error');
  }

  await db.insert(userList)
    .values({ listId: newList.id, userId: newUser.id })
    .returning()

  // FIXME: Remove this block as needed
  // await prisma.inventory.create({
  //   data: {
  //     user: {
  //       connect: {
  //         id: user.id
  //       }
  //     }
  //   }
  // })
  await db.insert(inventory).values({ userId: newUser.id })

  // FIXME: Remove this block as needed
  // await prisma.token.deleteMany({
  //   where: { type: "ACTIVATE_TOKEN", userId: newUser.id },
  // });
  await db.delete(token).where(and(eq(token.type, "ACTIVATE_TOKEN"), eq(token.userId, newUser.id)))

  const newToken = generateToken(32);
  const hashedToken = await PasswordHandler.hash(newToken);

  // FIXME: Remove this block as needed
  // await prisma.token.create({
  //   data: {
  //     type: "ACTIVATE_TOKEN",
  //     userId: newUser.id,
  //     sentTo: newUser.email,
  //     hashedToken: hashedToken,
  //     expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  //   },
  // });
  await db.insert(token).values({
    type: "ACTIVATE_TOKEN",
    userId: newUser.id,
    sentTo: newUser.email,
    hashedToken: hashedToken,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  })

  const activateUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/activateAccount?token=${newToken}`
  await sendEmail.queue.add('sendEmail', { type: 'ACTIVATE_ACCOUNT', email, url: activateUrl })

  await createSession({
    userId: newUser.id,
    role: "USER",
    email: newUser.email,
    verified: false
  })

}, SignupSchema, { authed: false })

export const verifyUser = createAction(async ({ session, updateSession }, data: { token: string }) => {
  // FIXME: Remove this block as needed
  // const userResult = await prisma.user.findUnique({
  //   where: { id: session?.data.userId },
  // });
  const userResult = session?.data.userId
    ? await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session.data.userId)
    })
    : undefined

  if (!userResult) {
    throw new Error("User not found");
  }

  const userToken = data.token;
  const hashedToken = await PasswordHandler.hash(userToken);

  // FIXME: Remove this block as needed
  // const foundToken = await prisma.token.findFirst({
  //   where: { hashedToken, type: "ACTIVATE_TOKEN" },
  //   include: { user: true },
  // });
  const foundToken = await db.query.token.findFirst({
    where: (tok, { eq, and }) => and(
      eq(tok.hashedToken, hashedToken),
      eq(tok.type, "ACTIVATE_TOKEN")
    ),
    with: {
      user: true
    }
  })

  if (!foundToken) {
    throw new Error("Invalid token");
  }

  // FIXME: Remove this block as needed
  // await prisma.token.delete({ where: { id: foundToken.id } });
  await db.delete(token).where(eq(token.id, foundToken.id))

  if (new Date(foundToken.expiresAt) < new Date()) {
    throw new Error("Token expired");
  }

  // FIXME: Remove this block as needed
  // await prisma.user.update({
  //   where: { id: userResult.id },
  //   data: { verified: true },
  // });
  await db.update(user).set({ verified: true }).where(eq(user.id, userResult.id))

  await updateSession({
    verified: true
  })

}, z.object({
  token: z.string()
}))

export const getCurrentUser = cache(createAction(async ({ session }) => {
  const userId = session?.data.userId;

  // FIXME: Remove this block as needed
  // const globalSettings = await prisma.globalSetting.findFirst({
  //   include: {
  //     features: true
  //   }
  // });
  const globalSettings = await db.query.globalSetting.findFirst({
    with: { features: true }
  })

  const isSitePrivate = globalSettings?.features.some(feature => feature.feature === 'private' && feature.isActive);

  if (!userId && !isSitePrivate) {
    return null; // Return null if there is no session and the site is not private
  }

  if (!userId) {
    throw new Error("No user id");
  }

  // FIXME: Remove this block as needed
  // const user = await prisma.user.findUnique({
  //   where: { id: userId },
  //   include: {
  //     inventory: userInventoryIncludes.user.include.inventory
  //   }
  // });
  const userResult = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
    with: {
      inventory: true
    }
  })

  if (!userResult) {
    throw new Error("Cannot find user")
  }

  return userResult;
}))

export const logoutAction = createAction(async ({ deleteSession }) => {
  await deleteSession()

  cookies().delete(COOKIE_SESSION_TOKEN);
  cookies().delete(COOKIE_CSRF_TOKEN);
  cookies().delete(COOKIE_PUBLIC_DATA_TOKEN);

  redirect('/login')
});

export const checkGuard = createAction(
  async ({ auth }, { rule }) => {
    const can = await auth.validate([rule[0], rule[1], rule[2]], { throw: false });
    return can!;
  },
  z.object({
    rule: z.tuple([z.enum(CrudTypesArray), z.string()]).rest(z.any()),
  })
);

export const forgotPasswordAction = createAction(async ({ }, { email }) => {
  // FIXME: Remove this block as needed
  // const user = await prisma.user.findUnique({
  //   where: { email },
  // });
  const userResult = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, email)
  })

  if (userResult) {
    // FIXME: Remove this block as needed
    // await prisma.token.deleteMany({
    //   where: { type: "RESET_PASSWORD", userId: userResult.id },
    // });
    await db.delete(token).where(and(eq(token.type, "RESET_PASSWORD"), eq(token.userId, userResult.id)))

    const newToken = generateToken(32);
    const hashedToken = await PasswordHandler.hash(newToken);

    // FIXME: Remove this block as needed
    // await prisma.token.create({
    //   data: {
    //     type: "RESET_PASSWORD",
    //     userId: userResult.id,
    //     sentTo: userResult.email,
    //     hashedToken: hashedToken,
    //     expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    //   },
    // });
    await db.insert(token).values({
      type: "RESET_PASSWORD",
      userId: userResult.id,
      sentTo: userResult.email,
      hashedToken: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${newToken}`;
    await sendEmail.queue.add('sendEmail', { type: 'FORGOT_PASSWORD', email, url: resetUrl })

  } else {
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  return;
}, ForgotPasswordSchema, { authed: false });

export const resetPasswordAction = createAction(
  async ({ createSession }, data: { token?: string, password: any }) => {
    const userToken = data.token;
    if (!userToken) {
      throw new Error("Invalid token");
    }

    const hashedToken = await PasswordHandler.hash(userToken);
    // FIXME: Remove this block as needed
    // const foundToken = await prisma.token.findFirst({
    //   where: { hashedToken, type: "RESET_PASSWORD" },
    //   include: { user: true },
    // });
    const foundToken = await db.query.token.findFirst({
      where: (tok, { and, eq }) => and(
        eq(tok.type, "RESET_PASSWORD"),
        eq(tok.hashedToken, hashedToken)
      ),
      with: { user: true }
    })

    if (!foundToken) {
      throw new Error("Invalid token");
    }

    // FIXME: Remove this block as needed
    // await prisma.token.delete({ where: { id: foundToken.id } });
    await db.delete(token).where(eq(token.id, foundToken.id));

    if (new Date(foundToken.expiresAt) < new Date()) {
      throw new Error("Token expired");
    }

    const userPassword = data.password;
    const hashedPassword = await PasswordHandler.hash(userPassword);

    // FIXME: Remove this block as needed
    // const user = await prisma.user.update({
    //   where: { id: foundToken.userId },
    //   data: { hashedPassword }
    // });
    const updatedUsers = await db.update(user)
      .set({ hashedPassword })
      .where(eq(user.id, foundToken.userId))
      .returning();

    const updatedUser = updatedUsers[0];
    if (!updatedUser) {
      throw new Error('Update user failed !');
    }

    // FIXME: Remove this block as needed
    // await prisma.session.deleteMany({ where: { userId: user.id } });
    await db.delete(session).where(eq(user.id, updatedUser.id))

    await createSession({
      userId: updatedUser.id,
      role: updatedUser.role as BaseRole,
      email: updatedUser.email,
      verified: updatedUser.verified
    })


    return updatedUser;
  },
  ResetPasswordSchema,
  { authed: false }
);


// OAUTH STUFF

export const handleOauth = async ({ email, auth }: { email: string, auth: AuthInit<BaseSessionData> }) => {
  // FIXME: Remove this block as needed
  // const foundUser = await prisma.user.findFirst({
  //   where: {
  //     email,
  //   }
  // });
  const foundUser = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, email)
  });

  if (foundUser) {
    const data = {
      userId: foundUser.id,
      role: foundUser.role as BaseRole,
      email: foundUser.email,
      verified: true
    }

    await auth.createSession(data);


    return foundUser;
  }

  if (!foundUser) {
    // FIXME: Remove this block as needed
    // const user = await prisma.user.create({
    //   data: {
    //     email,
    //     username: email,
    //     role: "USER",
    //     lists: {
    //       connect: {
    //         slug: 'general'
    //       }
    //     }
    //   },
    // });

    const newLists = await db.insert(list)
      .values({ slug: 'general', title: '' })
      .returning()

    const newUsers = await db.insert(user)
      .values({
        email,
        username: email,
        role: "USER"
      })
      .returning()

    const newUser = newUsers[0];
    const newList = newLists[0];

    if (!newUser || !newList) {
      throw new Error('Create new user or list failed')
    }

    await db.insert(userList)
      .values({ listId: newList.id, userId: newUser.id })
      .returning()

    await auth.createSession({
      userId: newUser.id,
      role: newUser.role as BaseRole,
      email: newUser.email,
      verified: true
    });

    /** This is because we call the createWorkspace function after creating the user.
     * The original user "const" doesn't have any workspace on it yet.
     * So we make a db call to get the updated version.  */

    // FIXME: Remove this block as needed
    // const getNewUser = await prisma.user.findUnique({
    //   where: { id: user.id },
    // });
    const getNewUser = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, newUser.id)
    })

    return getNewUser;
  }
}

export const OAuthUrl = async ({ provider, oauth }: {
  provider: Provider, oauth: {
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
  }
}) => {
  const auth = authInit({ driver: authDriver, guards: guards, oauth })
  const url = await auth.getOAuthUrl(provider);
  return url;
}


