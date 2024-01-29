'use server'
import Router from "@dir.zip/central-router"
import { authInit } from "./lib/auth";
import { getCurrentUser } from "./features/auth/actions";
import { Breadcrumbs } from "./components/ui/Breadcrumbs";
import { LoginPage } from "./features/auth/screens/login";
import { SignupPage } from "./features/auth/screens/signup";
import { ForgotPasswordPage } from "./features/auth/screens/forgot_password";
import { ResetPasswordPage } from "./features/auth/screens/reset_password";
import Admin from "./features/admin/screens";
import { Sidebar } from './components/ui/Sidebar'


import UsersAdminPage from "./features/admin/screens/users/page";
import SingleUserAdminPage from "./features/admin/screens/users/[id]/page";


import { BaseSessionData, type Resources, Routes } from ".";


import ToastProvider from "./components/ui/Toaster";
import { OAuthLogin, VerifyUser } from "./features/auth/webhooks";
import { UploadFileRoute } from "./features/files/routes";
import { AllResourcePage, SingleResourcePage } from "./features/admin/screens/resources/page";
import { AllPosts } from "./features/posts/screens";
import { AllCategoriesPage, NewCategoryPage, SingleCategoryPage } from "./features/admin/screens/categories/page";
import { NewPost } from "./features/posts/screens/new";
import { SinglePost } from "./features/posts/screens/single";
import { EditComment, SingleCommentScreen } from "./features/comments/screens";
import { ProfileScreen } from "./features/profile/screens";
import { AllItemsPage, NewItemPage, SingleItemPage } from "./features/admin/screens/items/page";
import { AllActionsPage, NewActionPage, SingleActionPage } from "./features/admin/screens/actions/page";
import { AllBadgesPage, NewBadgePage, SingleBadgePage } from "./features/admin/screens/badges/page";
import { EditPost } from "./features/posts/screens/edit";
import { ShopPage } from "./features/shop/screens";


import { redirect } from 'next/navigation'
import { FeedScreen } from "./features/feed/screens";
import { UserInventoryScreen, UserSettingsScreen } from "./features/user/screens";
import { AdminSidebar } from "./components/ui/AdminSidebar";
import { getUserInventory } from "./features/user/actions";
import { Inventory } from "packages/db";
import { UserWithInventory } from "./lib/types";
import { BroadcastsIndex } from "./features/admin/screens/broadcasts/screens";

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
    params: { "router": string[] };
    searchParams: { [key: string]: string | string[] | undefined };
    routes: Routes
    auth: ReturnType<typeof authInit<T & BaseSessionData>>;
    sidebarLinks?: { icon?: React.ElementType, url: string, text: string }[];
    resources: Resources
  }) {
  const getParams = params["router"]
  let rootPath: string


  for (const route of routes) {
    if (route.type === "page") {
      if (route.root) {
        rootPath = route.route
      }

      if (route.resource) {
        router.addRoute(`/:slug${route.route}`, route.handler)
      } else {
        router.addRoute(route.route, route.handler)
      }

    }

    if (route.type === "layout") {
      router.createLayout(route.route, async ({ children }) => {
        return <route.handler>{children}</route.handler>;
      })
    }
  }

  // Create admin routes for resource
  for (const resource of resources) {
    router.addRoute(`/admin/${resource.name.toLowerCase()}`, async (params) => {
      return <AllResourcePage resource={resource.name.toLowerCase()} schema={resource.schema} />
    })

    router.addRoute(`/admin/${resource.name.toLowerCase()}/:id`, async (params) => {
      return <SingleResourcePage resource={resource.name.toLowerCase()} params={params} schema={resource.schema} />
    })
  }



  router.createLayout("/admin/*", async ({ children }) => {
    const settings = await prisma?.globalSetting.findFirst({
      include: {
        features: true
      }
    })

    
    const user = await getCurrentUser()
    let inventory: Inventory | null = null
    if(user) {
      inventory = await getUserInventory({
        userId: user.id
      })
    }
    
    const memberCount = await prisma?.user.findMany()
    const tags = await prisma?.tag.findMany({
      where: {
        slug: {
          not: 'feed'
        }
      }
    });
    const tagsWithPostCount = tags ? await Promise.all(tags.map(async (tag) => {
      const count = await prisma?.post.count({
        where: {
          tags: {
            some: {
              id: tag.id
            },
            none: {
              slug: 'feed'
            }
          }
        }
      });
      return {
        ...tag,
        postCount: count ?? 0
      };
    })) : [];

    if(!user) {
      redirect('/login')
    }


    if (user.role !== "ADMIN") {
      throw new Error("You are not authorized to access this page.")
    }

    return (
      <div className="flex h-screen">
        <Sidebar
          siteTitle={settings?.siteTitle!}
          memberCount={memberCount!.length}
          tags={tagsWithPostCount}
          open={false}
          user={user}
        />
        <div className="flex min-w-0 flex-1">
          <div className="ml-20">
            <AdminSidebar />
          </div>
          <main className="flex flex-col w-0 flex-1 overflow-hidden">
            <div className="border-b border-b-border-subtle flex items-center">
              <div className="px-4 py-6">
                <Breadcrumbs ignore={[{ href: "/posts/*/comments", breadcrumb: "Comments" }]} />
              </div>
            </div>
            <div className="overflow-auto">
              {children}
            </div>
          </main>
        </div>
        <ToastProvider />
      </div>
    );
  })

  router.createLayout("/*", async ({ children }) => {
    const settings = await prisma?.globalSetting.findFirst({
      include: {
        features: true
      }
    })

    
    const user = await getCurrentUser()
    let inventory: Inventory | null = null
    if(user) {
      inventory = await getUserInventory({
        userId: user.id
      })
    }


    const memberCount = await prisma?.user.findMany()
    const tags = await prisma?.tag.findMany({
      where: {
        slug: {
          not: 'feed'
        }
      }
    });
    const tagsWithPostCount = tags ? await Promise.all(tags.map(async (tag) => {
      const count = await prisma?.post.count({
        where: {
          tags: {
            some: {
              id: tag.id
            },
            none: {
              slug: 'feed'
            }
          }
        }
      });
      return {
        ...tag,
        postCount: count ?? 0
      };
    })) : [];

    return (
      <div className="flex h-screen">
        <div className="md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar
              siteTitle={settings?.siteTitle!}
              memberCount={memberCount!.length}
              tags={tagsWithPostCount}
              open={true}
              user={user}
            />
          </div>
        </div>
        <main className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="border-b border-b-border-subtle flex items-center">
            <div className="px-4 py-6">
              <Breadcrumbs ignore={[{ href: "/posts/*/comments", breadcrumb: "Comments" }]} />
            </div>
          </div>
          <div className="overflow-auto">
            {children}
          </div>
        </main>
        <ToastProvider />
      </div>
    );
  })



  router.addRoute('/', async () => {
    redirect('/feed')
  })

  router.addRoute("/feed", async () => {
    return <FeedScreen />
  })

  router.addRoute('/posts', async () => {
    return <AllPosts />
  })

  router.addRoute("/posts/:slug", async ({ slug }) => {
    const currentUser = await getCurrentUser()
    return <SinglePost slug={slug} loggedIn={currentUser ? true : false} />
  })

  router.addRoute("/posts/:slug/comments/:commentId", async ({ slug, commentId }) => {
    return <SingleCommentScreen commentId={commentId} postSlug={slug}  />
  })

  router.addRoute("/posts/:slug/comments/:commentId/edit", async ({ commentId }) => {
    return <EditComment commentId={commentId} />
  })

  router.addRoute("/profile/:username", async ({ username }) => {
    return <ProfileScreen username={username} />
  })

  router.addRoute("/settings", async () => {
    return <UserSettingsScreen />
  })

  router.addRoute("/settings/inventory", async () => {
    return <UserInventoryScreen />
  })


  router.addRoute('/posts/new', async () => {
    const session = await auth.getSession();
    if (!session) {
      redirect('/login')
    }

    return <NewPost />
  })

  router.addRoute('/posts/:slug/edit', async ({ slug }) => {
    const session = await auth.getSession();
    if (!session) {
      redirect('/login')
    }

    return <EditPost slug={slug} />
  })

  router.addRoute('/shop', async () => {
    return <ShopPage />
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

  router.createLayout("/login", async ({ children }) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })

  router.createLayout("/signup", async ({ children }) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })

  router.createLayout("/forgot-password", async ({ children }) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    );
  })

  router.createLayout("/reset-password", async ({ children }) => {
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

  router.addRoute("/login", async () => {
    return <LoginPage auth={auth} />
  })

  router.addRoute("/signup", async () => {
    return <SignupPage searchParams={searchParams} />
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





  router.addRoute("/admin", async () => {
    return <Admin />;
  });

  router.addRoute('/admin/categories', async () => {
    return <AllCategoriesPage />
  })

  router.addRoute('/admin/categories/new', async () => {
    return <NewCategoryPage />
  })

  router.addRoute('/admin/categories/:id', async ({ id }) => {
    return <SingleCategoryPage id={id} />
  })

  router.addRoute('/admin/items', async () => {
    return <AllItemsPage />
  })

  router.addRoute('/admin/items/new', async () => {
    return <NewItemPage />
  })

  router.addRoute('/admin/items/:id', async ({ id }) => {
    return <SingleItemPage id={id} />
  })

  router.addRoute('/admin/actions', async () => {
    return <AllActionsPage />
  })

  router.addRoute('/admin/actions/new', async () => {
    return <NewActionPage />
  })

  router.addRoute('/admin/actions/:id', async ({ id }) => {
    return <SingleActionPage id={id} />
  })

  router.addRoute('/admin/badges', async () => {
    return <AllBadgesPage />
  })

  router.addRoute('/admin/badges/new', async () => {
    return <NewBadgePage />
  })

  router.addRoute('/admin/badges/:id', async ({ id }) => {
    return <SingleBadgePage id={id} />
  })


  router.addRoute('/admin/users', async () => {
    return <UsersAdminPage />
  })

  router.addRoute('/admin/users/:id', async (params) => {
    return <SingleUserAdminPage id={params.id} />
  })

  router.addRoute('/admin/broadcasts', async() => {
    return <BroadcastsIndex />
  })




  router.addRoute('/activateAccount', async (_, request) => {
    return VerifyUser(request!)
  }, 'api:GET')


  router.addRoute('/auth/google', async (_, request) => {
    return OAuthLogin(request!, 'google', auth)
  }, 'api:GET')

  router.addRoute('/auth/github', async (_, request) => {
    return OAuthLogin(request!, 'github', auth)
  }, 'api:GET')


  router.addRoute('/files/upload', async (_, request) => {
    const user = await getCurrentUser();

    if (!user) {
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
  return await router.initLayout({ children })
}

export async function ApiRouteInit() {
  const routes = router.initApiRoute()
  return routes
}
