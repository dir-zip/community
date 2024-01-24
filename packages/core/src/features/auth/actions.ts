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

import { prisma } from "@dir/db";
import sendEmail from '../../jobs/sendEmail'
import { cookies } from "next/headers";

import { z } from "zod";
import {
  ResetPasswordSchema,
  ForgotPasswordSchema,
  SignupSchema,
  LoginSchema,
} from "./schemas";

import {createAction} from '../../lib/createAction';
import { BaseSessionData, type BaseRole } from '../../index';
import { cache } from "react";
import { authInit } from '../../lib/auth';
import authDriver from '../../authDriver';
import { guards } from '../../guards';
import { redirect } from 'next/navigation';
import { userInventoryIncludes } from "~/lib/includes";



export const loginAction = createAction(async ({createSession}, { email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

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
}, LoginSchema, {authed: false})

export const signUpAction = createAction(async ({createSession}, { email, password, username }) => {
  const hashedPassword = await PasswordHandler.hash(password);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      hashedPassword: hashedPassword
    },
  });

  await prisma.inventory.create({
    data: {
      user: {
        connect: {
          id: user.id
        }
      }
    }
  })
  


  await prisma.token.deleteMany({
    where: { type: "ACTIVATE_TOKEN", userId: user.id },
  });
  const token = generateToken(32);
  const hashedToken = await PasswordHandler.hash(token);
  await prisma.token.create({
    data: {
      type: "ACTIVATE_TOKEN",
      userId: user.id,
      sentTo: user.email,
      hashedToken: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });


 
  const activateUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/activateAccount?token=${token}`
  await sendEmail.queue.add('sendEmail', {type: 'ACTIVATE_ACCOUNT', email, url: activateUrl})

  await createSession({
    userId: user.id,
    role: "USER",
    email: user.email,
    verified: false
  })

}, SignupSchema, {authed: false})

export const verifyUser = createAction(async({session, updateSession}, {token}) => {
  const user = await prisma.user.findUnique({
    where: { id: session?.data.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hashedToken = await PasswordHandler.hash(token);
  const foundToken = await prisma.token.findFirst({
    where: { hashedToken, type: "ACTIVATE_TOKEN" },
    include: { user: true },
  });

  if (!foundToken) {
    throw new Error("Invalid token");
  }

  await prisma.token.delete({ where: { id: foundToken.id } });

  if (foundToken.expiresAt < new Date()) {
    throw new Error("Token expired");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true },
  });
  
  await updateSession({
    verified: true
  })
  
}, z.object({
  token: z.string()
}))

export const getCurrentUser = cache(createAction(async ({ session }) => {
  const userId = session?.data.userId;
  const globalSettings = await prisma.globalSetting.findFirst({
    include: {
      features: true
    }
  });
  const isSitePrivate = globalSettings?.features.some(feature => feature.feature === 'private' && feature.isActive);

  if (!userId && !isSitePrivate) {
    return null; // Return null if there is no session and the site is not private
  }

  if (!userId) {
    throw new Error("No user id");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      inventory: userInventoryIncludes.user.include.inventory
    }
  });

  if(!user) {
    throw new Error("Cannot find user")
  }

  return user;
}))

export const logoutAction = createAction(async ({ deleteSession }) => {
  await deleteSession()

  cookies().delete(COOKIE_SESSION_TOKEN);
  cookies().delete(COOKIE_CSRF_TOKEN);
  cookies().delete(COOKIE_PUBLIC_DATA_TOKEN);

  redirect('/login')
});

export const checkGuard = createAction(
  async ({auth}, { rule }) => {
    const can = await auth.validate([rule[0], rule[1], rule[2]]);
    return can!;
  },
  z.object({
    rule: z.tuple([z.enum(CrudTypesArray), z.string()]).rest(z.any()),
  })
);

export const forgotPasswordAction = createAction(async ({}, { email }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    await prisma.token.deleteMany({
      where: { type: "RESET_PASSWORD", userId: user.id },
    });
    const token = generateToken(32);
    const hashedToken = await PasswordHandler.hash(token);
    await prisma.token.create({
      data: {
        type: "RESET_PASSWORD",
        userId: user.id,
        sentTo: user.email,
        hashedToken: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendEmail.queue.add('sendEmail', {type: 'FORGOT_PASSWORD', email, url: resetUrl})

    
  } else {
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  return;
}, ForgotPasswordSchema, {authed: false});

export const resetPasswordAction = createAction(
  async ({createSession}, { token, password }) => {
    if (!token) {
      throw new Error("Invalid token");
    }

    const hashedToken = await PasswordHandler.hash(token);
    const foundToken = await prisma.token.findFirst({
      where: { hashedToken, type: "RESET_PASSWORD" },
      include: { user: true },
    });

    if (!foundToken) {
      throw new Error("Invalid token");
    }

    await prisma.token.delete({ where: { id: foundToken.id } });

    if (foundToken.expiresAt < new Date()) {
      throw new Error("Token expired");
    }

    const hashedPassword = await PasswordHandler.hash(password);
    const user = await prisma.user.update({
      where: { id: foundToken.userId },
      data: { hashedPassword }
    });

    await prisma.session.deleteMany({ where: { userId: user.id } });

    await createSession({
      userId: user.id,
      role: user.role as BaseRole,
      email: user.email,
      verified: user.verified
    })


    return user;
  },
  ResetPasswordSchema,
  {authed: false}
);


// OAUTH STUFF

export const handleOauth = async ({email, auth}: {email: string, auth: AuthInit<BaseSessionData>}) => {

  const foundUser = await prisma.user.findFirst({
    where: {
      email,
    }
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
    const user = await prisma.user.create({
      data: {
        email,
        username: email,
        role: "USER",
      },
    });


    await auth.createSession({
      userId: user.id,
      role: user.role as BaseRole,
      email: user.email,
      verified: true
    });


    /** This is because we call the createWorkspace function after creating the user.
     * The original user "const" doesn't have any workspace on it yet.
     * So we make a db call to get the updated version.  */
    const getNewUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    return getNewUser;
  }
}

export const OAuthUrl = async ({provider, oauth}: {provider: Provider, oauth: {
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
}}) => {
  const auth = authInit({driver: authDriver, guards: guards, oauth})
  const url = await auth.getOAuthUrl(provider);
  return url;
}


