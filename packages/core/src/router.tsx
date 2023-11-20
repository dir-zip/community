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
import { AllPosts } from "./features/posts/screens";
import { AllCategoriesPage, NewCategoryPage, SingleCategoryPage } from "./features/admin/screens/categories/page";
import { NewPost } from "./features/posts/screens/new";
import { SinglePost } from "./features/posts/screens/single";
import { SingleCommentScreen } from "./features/comments/screens";
import { ProfileScreen } from "./features/profile/screens";
import { AllItemsPage, NewItemPage, SingleItemPage } from "./features/admin/screens/items/page";
import { AllActionsPage, NewActionPage, SingleActionPage } from "./features/admin/screens/actions/page";
import { AllBadgesPage, NewBadgePage, SingleBadgePage } from "./features/admin/screens/badges/page";
import { EditPost } from "./features/posts/screens/edit";




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
        router.addRoute(`/:slug${route.route}`, route.handler)
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
          currentUser={user}
        />
  
        <main className="flex-1 min-w-0 overflow-auto p-8 pt-6">
          <div className="pb-12 md:pb-6">
            <Breadcrumbs
              ignore={[
                { href: "/posts", breadcrumb: "Posts" }, 
                { href: "/posts/:slug/comments", breadcrumb: "Comments" }
              ]}
            />
          </div>
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })

  router.createLayout("/*", async ({children}) => {
    const user = await getCurrentUser()

    return (
      <div className="min-h-screen flex">
        <Sidebar 
          adminSidebarComponent={false} 
          root={`/`} 
          sidebarLinks={sidebarLinks}
          resources={resources}
          currentUser={user}
        />
  
        <main className="flex-1 min-w-0 overflow-auto p-8 pt-6">
          <div className="pb-12 md:pb-6">
            <Breadcrumbs
              ignore={[{ href: "/posts", breadcrumb: "Posts" },{ href: "/posts/:slug/comments", breadcrumb: "Comments" }]}
            />
          </div>
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })



  router.addRoute("/", async() => {
    const session = await auth.getSession();
    return <AllPosts loggedIn={session ? true : false}/>
  })

  router.addRoute("/posts/:slug", async({slug}) => {
    const session = await auth.getSession();
    return <SinglePost slug={slug} loggedIn={session ? true : false}/>
  })

  router.addRoute("/posts/:slug/comments/:commentId", async({slug, commentId}) => {
    const session = await auth.getSession();
    return <SingleCommentScreen commentId={commentId} postSlug={slug} loggedIn={session ? true : false}/>
  })

  router.addRoute("/profile/:username", async({username}) => {
    return <ProfileScreen username={username} />
  })

  /** 
   * 
   * 
   * 
   * START AUTH
   * 
   * 
   *
   **/

  // AUTH LAYOUTS

  router.createLayout("/login", async ({children}) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })

  router.createLayout("/signup", async ({children}) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })

  router.createLayout("/forgot-password", async ({children}) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })

  router.createLayout("/reset-password", async ({children}) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })

  // AUTH ROUTES

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

  /** 
   * 
   * 
   * 
   * END AUTH
   * 
   * 
   **/
  

  router.addRoute('/posts/new', async() => {
    const session = await auth.getSession();
    if(!session) {
      throw new Error("You do not belong here.")
    }

    return <NewPost />
  })

  router.addRoute('/posts/:slug/edit', async({slug}) => {
    const session = await auth.getSession();
    if(!session) {
      throw new Error("You do not belong here.")
    }

    return <EditPost slug={slug}/>
  })

  router.addRoute("/admin", async () => {
    return <Admin />;
  });

  router.addRoute('/admin/categories', async() => {
    return <AllCategoriesPage />
  })

  router.addRoute('/admin/categories/new', async() => {
    return <NewCategoryPage />
  })

  router.addRoute('/admin/categories/:id', async({id}) => {
    return <SingleCategoryPage id={id} />
  })

  router.addRoute('/admin/items', async() => {
    return <AllItemsPage />
  })

  router.addRoute('/admin/items/new', async() => {
    return <NewItemPage />
  })

  router.addRoute('/admin/items/:id', async({id}) => {
    return <SingleItemPage id={id} />
  })

  router.addRoute('/admin/actions', async() => {
    return <AllActionsPage />
  })

  router.addRoute('/admin/actions/new', async() => {
    return <NewActionPage />
  })

  router.addRoute('/admin/actions/:id', async({id}) => {
    return <SingleActionPage id={id} />
  })

  router.addRoute('/admin/badges', async() => {
    return <AllBadgesPage />
  })

  router.addRoute('/admin/badges/new', async() => {
    return <NewBadgePage />
  })

  router.addRoute('/admin/badges/:id', async({id}) => {
    return <SingleBadgePage id={id} />
  })


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


