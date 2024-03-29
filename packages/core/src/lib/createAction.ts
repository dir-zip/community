"use server";
import {
  type CreateNewSessionParams,
  type SetSessionData,
  type CrudTypes,
  TCreateGuard,
  Provider,
  Data,
  AuthInit
} from "@dir/auth";
import { type z } from "zod";
import { redirect } from "next/navigation";
import { authInit } from "./auth";
import authDriver from "../authDriver";
import { BaseSessionData } from "..";
import { guards } from "../guards";
import { db } from '@dir/db'



type TCtx<S> = {
  session: CreateNewSessionParams<BaseSessionData & S>;
  createSession: (data: Data<BaseSessionData & S>) => Promise<CreateNewSessionParams<BaseSessionData & S>>;
  deleteSession: () => Promise<void>;
  updateSession: (data: Partial<SetSessionData<BaseSessionData & S>>) => Promise<SetSessionData<BaseSessionData | BaseSessionData & S>>
  validate: (rule: [CrudTypes, string, ...unknown[]]) => Promise<void>
  auth: AuthInit<S & BaseSessionData>
};

export type FunctionWithSchema<T, P extends z.ZodType<any, any>, S> = (
  ctx: TCtx<S>,
  input: z.infer<P>
) => Promise<T>;

export const createAction = <T, P extends z.ZodType<any, any>, S>(
  fn: FunctionWithSchema<T, P, S>,
  schema?: P,
  options: {
    authed: boolean
  } = { authed: true },
  auth?: {
    guards: TCreateGuard<S & BaseSessionData>,
    oauth: {
      providers: {
        [key in Provider]: { clientId: string, clientSecret: string }
      },
      baseUrl: string
    }
  },
): ((input?: z.infer<P>) => Promise<T>) => {
  return async (input?: z.infer<P>) => {

    const authed = options.authed === false ? false : options.authed === true ? true :
      (await db.query.globalSetting.findFirst({
        where: (setting, { eq }) => eq(setting.id, 1),
        with: {
          features: true
        }
      }))?.features.find(f => f.feature === 'private')?.isActive!


    const _auth = authInit<S & BaseSessionData>({ driver: authDriver, guards: auth ? auth.guards : guards, oauth: auth ? auth.oauth : undefined });


    let ctx: Partial<TCtx<S>> = {
      createSession: _auth.createSession,
      auth: _auth
    }

    if (authed) {
      const session = await _auth.getSession();

      if (!session) {
        const isPrivate = await db.query.globalSetting.findFirst({
          where: (setting, { eq }) => eq(setting.id, 1),
          with: {
            features: true
          }
        })

        isPrivate?.features.find(f => f.feature === 'private')?.isActive ? redirect('/login') : null
      } else {
        ctx = {
          session,
          updateSession: _auth.updateSession,
          createSession: _auth.createSession,
          deleteSession: _auth.deleteSession,
          validate: async (rule) => {
            await _auth.validate(rule, { throw: true })
          },
          auth: _auth
        }
      }


    }


    try {
      const parsedInput = schema ? schema.parse(input) as z.infer<P> : input as z.infer<P>;
      const result = await fn(ctx as TCtx<S>, parsedInput)
      // do something with result
      return result
    } catch (error) {
      // handle error
      throw error;
    }
  }
};
