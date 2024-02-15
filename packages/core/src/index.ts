import { type FunctionWithSchema, createAction } from "./lib/createAction";
import createApiEndpoint from "./lib/createApiEndpoint";
import { Metadata } from 'next'
import { authInit } from "./lib/auth";
import { PageInit, LayoutInit, ApiRouteInit, getMetadata } from "./router";


import "@dir/ui/dist/index.css";
import "../dist/output.css";

import authDriver from "./authDriver";
export { PageInit, LayoutInit } from "./router";
import type { AuthInit, Provider, TCreateGuard } from "@dir/auth";
import { createGuards, guards } from "./guards";
import {
  handleOauth,
} from "./features/auth/actions";
import { type JSXElementConstructor, type ReactElement } from "react";
import { createJob } from "./lib/jobs";
import { ZodTypeAny } from "zod";
import { schema, InferSelectModel } from '@dir/db'



export type BaseRole = "ADMIN" | "USER";
export type BaseSessionData = {
  userId: string;
  role: BaseRole;
  email: string;
  verified: boolean;
};

export type SidebarLinks = {
  icon?: React.ElementType;
  url: string;
  text: string;
}[];

type ExtendedAuthInit<T> = ReturnType<typeof authInit<T & BaseSessionData>> & {
  handleOauth: ({ email }: { email: string }) => Promise<InferSelectModel<typeof schema.user>>;
};

type BaseExportedPlugins<T> = {
  createAction: <F>(
    fn: FunctionWithSchema<F, ZodTypeAny, T>,
    options?: {
      authed: boolean;
    },
  ) => Promise<F>;
  createApiEndpoint: typeof createApiEndpoint;
  createJob: typeof createJob;
  PageInit: ({
    params,
    searchParams,
  }: {
    params: { router: string[] };
    searchParams: { [key: string]: string | string[] };
  }) => Promise<
    ReactElement<any, string | JSXElementConstructor<any>> | Response
  >;
  LayoutInit: typeof LayoutInit;
  ApiRouteInit: typeof ApiRouteInit;
  generateMetadata: (params: { router: string[] }) => Promise<Metadata>;
};

type ExportedPlugins<T> = BaseExportedPlugins<T>;

export type RouteHandler<T extends RouteParams<string>> = (
  params: T,
) => Promise<React.ReactElement>;

export type RouteParams<Path extends string> =
  Path extends `${infer Segment}/${infer Rest}`
  ? Segment extends `:${infer Param}`
  ? { [K in Param]: string } & RouteParams<Rest>
  : RouteParams<Rest>
  : Path extends `:${infer Param}`
  ? { [K in Param]: string }
  : Record<string, never>;

export type Route<Path extends string> = {
  type: "page" | "layout";
  route: Path;
  handler: RouteHandler<RouteParams<Path>> | LayoutHandler;
};

export type LayoutHandler =
  | React.ComponentType<{ children: React.ReactNode }>
  | (({
    children,
  }: {
    children: React.ReactNode;
  }) => Promise<React.ReactElement>);

export type Layout<Path extends string> = {
  type: "layout";
  route: Path;
  handler: LayoutHandler;
};

export type Routes = Array<
  | {
    type: "page";
    root?: boolean;
    resource?: boolean;
    route: string;
    handler: RouteHandler<any>;
  }
  | { type: "layout"; route: string; handler: LayoutHandler }
>;

export type ResourceRoutes = Array<{
  path: string;
  root?: boolean;
  handler: RouteHandler<any>;
}>;

export type ResourceSchemaType = "text" | "number" | "date";

export type ResourceSchema = Array<{
  type: ResourceSchemaType;
  accessorKey: string;
  id: string;
}>;

export type Resources = Array<{
  name: string;
  schema: ResourceSchema;
}>;

interface Initializer<T> {
  addRoute: <Path extends string>(
    path: Path,
    handler: RouteHandler<RouteParams<Path>>,
  ) => Initializer<T>;
  addLayout: <Path extends string>(
    path: Path,
    handler: LayoutHandler,
  ) => Initializer<T>;
  createResource: ({
    name,
    routes,
    schema,
  }: {
    name: string;
    routes: ResourceRoutes;
    schema: ResourceSchema;
  }) => Initializer<T>;
  build: () => ExportedPlugins<T>;
}

export function InitDirZip<S>({
  auth,
}: {
  auth: {
    guards: TCreateGuard<S & BaseSessionData>;
    oauth: {
      providers: {
        [key in Provider]: { clientId: string; clientSecret: string };
      };
      baseUrl: string;
    };
  };
}): Initializer<S> {
  const exportedPlugins: ExportedPlugins<S> = {} as ExportedPlugins<S>;
  const _routes: Routes = [];

  const _guards = createGuards<S & BaseSessionData>({
    guards: auth.guards,
    internal: guards,
  });

  function withHandleOauth(auth: AuthInit<S & BaseSessionData>) {
    const injected = ({ email }: { email: string }) => {
      return handleOauth({
        email,
        auth: auth as unknown as AuthInit<BaseSessionData>,
      });
    };

    return {
      ...auth,
      handleOauth: injected,
    } as ExtendedAuthInit<S & BaseSessionData>; // Here use the ExtendedAuthInit type
  }

  const _auth = withHandleOauth(
    authInit<S & BaseSessionData>({
      driver: authDriver,
      guards: _guards,
      oauth: auth.oauth,
    }),
  );
  const _resources: Resources = [];

  const createInjectedAction = async <T>(
    fn: FunctionWithSchema<T, ZodTypeAny, S>,
    options: {
      authed: boolean;
    } = { authed: true },
  ): Promise<T> => {
    // We call the action, otherwise createAction won't be accessible outside pages. Otherwise, we get error "Cannot access 'createAction' before initialization"
    const action = createAction(fn, undefined, options, {
      guards: _guards,
      oauth: auth.oauth,
    });
    const result = await action();
    return result;
  };

  exportedPlugins.generateMetadata = async function(params: { router: string[] }) {
    return getMetadata(params)
  };

  exportedPlugins.PageInit = async function({ params, searchParams }) {
    const result = await PageInit<S>({
      params,
      searchParams,
      routes: _routes,
      auth: _auth,
      resources: _resources,
    })

    if (result === null) {
      throw new Error("PageInit returned null");
    }

    return result;
  };

  const self: Initializer<S> = {
    addRoute: <Path extends string>(
      path: Path,
      handler: RouteHandler<RouteParams<Path>>,
    ) => {
      _routes.push({
        type: "page",
        route: path,
        handler,
      });
      return self; // Allow chaining
    },
    addLayout: <Path extends string>(path: Path, handler: LayoutHandler) => {
      _routes.push({
        route: path,
        handler,
        type: "layout",
      });
      return self; // Allow chaining
    },
    createResource: ({ name, routes, schema }) => {
      _resources.push({
        name: name.trim().toUpperCase(),
        schema,
      });

      for (const route of routes) {
        _routes.push({
          route: `${route.path}`,
          handler: route.handler,
          root: route.root,
          resource: true,
          type: "page",
        });
      }
      return self;
    },
    build: () => {
      exportedPlugins.createAction = createInjectedAction;
      exportedPlugins.createApiEndpoint = createApiEndpoint;
      exportedPlugins.createJob = createJob;
      exportedPlugins.LayoutInit = LayoutInit;
      exportedPlugins.ApiRouteInit = ApiRouteInit;
      return exportedPlugins;
    },
  };

  return self;
}
