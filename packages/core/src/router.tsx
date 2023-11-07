'use server'
import Router from "@1upsaas/1uprouter"
import { authInit } from "./lib/auth";
import { getCurrentUser } from "./features/auth/actions";
import {Breadcrumbs} from "./components/ui/Breadcrumbs";

import { LoginPage } from "./features/auth/screens/login";
import { SignupPage } from "./features/auth/screens/signup";
import { ForgotPasswordPage } from "./features/auth/screens/forgot_password";
import { ResetPasswordPage } from "./features/auth/screens/reset_password";
import Admin from "./features/admin/screens";
import Sidebar from "./components/ui/Sidebar";

import '../dist/output.css'

import UsersAdminPage from "./features/admin/screens/users/page";
import SingleUserAdminPage from "./features/admin/screens/users/[id]/page";
import TokensAdminPage from "./features/admin/screens/tokens/page";
import SingleTokenAdminPage from "./features/admin/screens/tokens/[id]/page";
import SessionsAdminPage from "./features/admin/screens/sessions/page";
import SingleSessionAdminPage from "./features/admin/screens/sessions/[id]/page";

import { BaseSessionData, type Resources, Routes } from ".";



import ToastProvider from "./components/ui/Toaster";
import { OAuthLogin, VerifyUser } from "./features/auth/webhooks";
import { UploadFileRoute } from "./features/files/routes";
import { AllResourcePage, SingleResourcePage } from "./features/admin/screens/resources/page";




const router = new Router();


export async function PageInit<T>({
  params,
  searchParams,
  routes,
  auth,
  sidebarLinks,
  resources
}: 
{
  params: { "1up": string[] };
  searchParams: { [key: string]: string | string[] | undefined };
  routes: Routes
  auth: ReturnType<typeof authInit<T & BaseSessionData>>;
  sidebarLinks?: {icon?: React.ElementType, url: string, text:string}[];
  resources: Resources
}) {
  const getParams = params["1up"]
  let rootPath: string


  for(const route of routes) {
    if(route.type === "page") {
      if(route.root) {
        rootPath = route.route
      }

      if(route.resource) {
        router.addRoute(`/workspace/:slug${route.route}`, route.handler)
      } else {
        router.addRoute(route.route, route.handler)
      }
      
    }

    if(route.type === "layout") {
      router.createLayout(route.route, async ({children}) => {
        return <route.handler>{children}</route.handler>;
      })
    }
  }

  // Create admin routes for resource
  for(const resource of resources) {
    router.addRoute(`/admin/${resource.name.toLowerCase()}`, async (params) => {
      return <AllResourcePage resource={resource.name.toLowerCase()} schema={resource.schema}/>
    })

    router.addRoute(`/admin/${resource.name.toLowerCase()}/:id`, async (params) => {
      return <SingleResourcePage resource={resource.name.toLowerCase()} params={params} schema={resource.schema}/>
    })
  }

  await router.createLayout("/admin/*", async({children}) => {
    const user = await getCurrentUser();
  
    const session = await auth.getSession();
    if(!session) {
      throw new Error("You do not belong here.")
    }

  
    if(user.role !== "ADMIN") {
      throw new Error("You are not authorized to access this page.")
    }
  
    return (
      <div className="min-h-screen flex">
        <Sidebar 
          adminSidebarComponent={true} 
          root={`/`} 
          sidebarLinks={sidebarLinks}
          resources={resources}
        />
  
        <main className="flex-1 min-w-0 overflow-auto p-8 pt-6">
          <div className="pb-12 md:pb-6">
            <Breadcrumbs
              ignore={[{ href: "/workspace", breadcrumb: "Workspace" }]}
            />
          </div>
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })


  router.addRoute("/login", async() => {
    return <LoginPage auth={auth}/>
  })

  router.addRoute("/signup", async () => {
    return <SignupPage searchParams={searchParams}/>
  })

  router.addRoute('/forgot-password', async () => {
    return <ForgotPasswordPage />
  })

  router.addRoute('/reset-password', async () => {
    return <ResetPasswordPage />
  })

  router.addRoute("/admin", async () => {
    return <Admin />;
  });


  router.addRoute('/admin/users', async() => {
    return <UsersAdminPage />
  })

  router.addRoute('/admin/users/:id', async(params) => {
    return <SingleUserAdminPage id={params.id} />
  })

  router.addRoute('/admin/tokens', async() => {
    return <TokensAdminPage />
  })

  router.addRoute('/admin/tokens/:id', async(params) => {
    return <SingleTokenAdminPage id={params.id} />
  })

  router.addRoute('/admin/sessions', async() => {
    return <SessionsAdminPage />
  })

  router.addRoute('/admin/sessions/:id', async(params) => {
    return <SingleSessionAdminPage id={params.id} />
  })


  router.addRoute('/activateAccount', async(_, request) => {
    return VerifyUser(request!)
  }, 'api:GET')


  router.addRoute('/auth/google', async(_, request) => {
   return OAuthLogin(request!, 'google', auth)
  }, 'api:GET')

  router.addRoute('/auth/github', async(_, request) => {
    return OAuthLogin(request!, 'github', auth)
   }, 'api:GET')


  router.addRoute('/files/upload', async(_, request) => {
    const user = await getCurrentUser();

    if(!user) {
      throw new Error("You are not authorized")
    }
    return UploadFileRoute(request!)
  }, 'api:POST')

  return router.init(getParams);
}

export async function LayoutInit({
  children,
}: {
  children: React.ReactNode;
}) {
  return await router.initLayout({children})
}

export async function ApiRouteInit() {
  const routes = router.initApiRoute()
  return routes
}


