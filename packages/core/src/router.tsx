"use server"
import Router from "@dir.zip/central-router"
import { authInit } from "./lib/auth"
import { getCurrentUser } from "./features/auth/actions"
import { Breadcrumbs } from "./components/ui/Breadcrumbs"
import { LoginPage } from "./features/auth/screens/login"
import { SignupPage } from "./features/auth/screens/signup"
import { ForgotPasswordPage } from "./features/auth/screens/forgot_password"
import { ResetPasswordPage } from "./features/auth/screens/reset_password"
import { Sidebar } from "./components/ui/Sidebar"
import { MobileNavBar } from "./components/ui/MobileNavBar"

import AdminMenu from "./features/admin/screens"
import { AdminSiteSettings } from "./features/admin/screens/site/page"
import UsersAdminPage from "./features/admin/screens/users/page"
import SingleUserAdminPage from "./features/admin/screens/users/[id]/page"

import { BaseSessionData, type Resources, Routes } from "."

import ToastProvider from "./components/ui/Toaster"
import { OAuthLogin, VerifyUser } from "./features/auth/webhooks"
import { UploadFileRoute } from "./features/files/routes"
import {
  AllResourcePage,
  SingleResourcePage,
} from "./features/admin/screens/resources/page"
import { AllPosts } from "./features/posts/screens"
import {
  AllCategoriesPage,
  NewCategoryPage,
  SingleCategoryPage,
} from "./features/admin/screens/categories/page"
import { NewPost } from "./features/posts/screens/new"
import { SinglePost } from "./features/posts/screens/single"
import { EditComment, SingleCommentScreen } from "./features/comments/screens"
import { ProfileScreen } from "./features/profile/screens"
import {
  AllItemsPage,
  NewItemPage,
  SingleItemPage,
} from "./features/admin/screens/items/page"
import {
  AllActionsPage,
  NewActionPage,
  SingleActionPage,
} from "./features/admin/screens/actions/page"
import {
  AllBadgesPage,
  NewBadgePage,
  SingleBadgePage,
} from "./features/admin/screens/badges/page"
import { EditPost } from "./features/posts/screens/edit"
import { ShopPage } from "./features/shop/screens"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { FeedScreen } from "./features/feed/screens"
import {
  UserInventoryScreen,
  UserInviteSettings,
  UserSettingsScreen,
} from "./features/user/screens"
import { AdminSidebar } from "./components/ui/AdminSidebar"
import { getUserInventory } from "./features/user/actions"
import { db, schema, InferSelectModel, count, eq, and, not, inArray } from "@dir/db"
import { BroadcastsIndex } from "./features/admin/screens/broadcasts/screens"
import {
  AllListsPage,
  EditListPage,
  NewListPage,
  SingleListPage,
} from "./features/admin/screens/lists/screens"
import { Unsubscribe } from "./features/lists/action"
import { ClosedSignupPage } from "./features/auth/screens/closed_signup"
import { InviteSignupPage } from "./features/auth/screens/invite_signup"
import { metadata } from "./lib/metadata"
import { ographImageGenerator, size } from "./lib/ographImageGenerator"
import { getSinglePost } from "./features/posts/actions"
import { getComment } from "./features/comments/actions"
import { post, postTags, tag } from "packages/db/drizzle/schema"

const router = new Router()

export async function getMetadata(params: { router: string[] }) {
  const getParams = params["router"]
  return router.generateMetadata(getParams)
}

export async function PageInit<T>({
  params,
  searchParams,
  routes,
  auth,
  resources,
}: {
  params: { router: string[] }
  searchParams: { [key: string]: string | string[] | undefined }
  routes: Routes
  auth: ReturnType<typeof authInit<T & BaseSessionData>>
  resources: Resources
}) {
  const getParams = params["router"]

  // FIXME: Remove this block as needed
  // const settings = await prisma?.globalSetting.findFirst()
  const settings = await db.query.globalSetting.findFirst();

  // FIXME: Remove this block as needed
  // const tags = await prisma?.tag.findMany({
  //   where: {
  //     slug: {
  //       not: "feed",
  //     },
  //   },
  //   orderBy: {
  //     posts: {
  //       _count: "desc",
  //     },
  //   },
  //   take: 10, // Limit to the top 10 tags, adjust as needed
  // })
  const tags = await db.query.tag.findMany({
    where: (tag, { not, eq }) => not(eq(tag.slug, "feed")),
    limit: 10
  })

  const preFilledMetadata = ({
    pageTitle,
    type = "website",
    author,
  }: {
    pageTitle: string
    type?: "website" | "article"
    author?: string
  }) => {
    let imageUrl = `${process.env.NEXT_PUBLIC_APP_URL
      }/api/ographimage?siteTitle=${encodeURIComponent(
        settings?.siteTitle as string
      )}&pageTitle=${encodeURIComponent(pageTitle)}`

    if (author) {
      imageUrl += `&author=${encodeURIComponent(author)}`
    }
    const meta = metadata({
      siteTitle: settings?.siteTitle as string,
      pageTitle: pageTitle,
      description: settings?.siteDescription as string,
      keywords: tags?.map((tag) => tag.slug) ?? [],
      images: [{ ...size, url: imageUrl }],
      type: type,
      author: type === "article" ? author : undefined,
    })

    return meta
  }

  for (const route of routes) {
    if (route.type === "page") {
      if (route.root) {
        var rootPath = route.route
      }

      if (route.resource) {
        router.addRoute(`/:slug${route.route}`, route.handler)
      } else {
        router.addRoute(route.route, route.handler)
      }
    }

    if (route.type === "layout") {
      router.createLayout(route.route, async ({ children }) => {
        return <route.handler>{children}</route.handler>
      })
    }
  }

  // Create admin routes for resource
  for (const resource of resources) {
    router.addRoute(`/admin/${resource.name.toLowerCase()}`, async (params) => {
      return (
        <AllResourcePage
          resource={resource.name.toLowerCase()}
          schema={resource.schema}
        />
      )
    })

    router.addRoute(
      `/admin/${resource.name.toLowerCase()}/:id`,
      async (params) => {
        return (
          <SingleResourcePage
            resource={resource.name.toLowerCase()}
            params={params}
            schema={resource.schema}
          />
        )
      }
    )
  }

  router.createLayout("/admin/*", async ({ children }) => {
    // FIXME: Remove this block as needed
    // const settings = await prisma?.globalSetting.findFirst({
    //   include: {
    //     features: true,
    //   },
    // })
    const settings = await db.query.globalSetting.findFirst({
      with: {
        features: true
      }
    })

    const user = await getCurrentUser()
    let inventory: Inventory | null = null
    if (user) {
      inventory = await getUserInventory({
        userId: user.id,
      })
    }

    // FIXME: Remove this block as needed
    // const memberCount = await prisma?.user.findMany()
    const memberCount = await db.query.user.findMany()

    // FIXME: Remove this block as needed
    // const tags = await prisma?.tag.findMany({
    //   where: {
    //     slug: {
    //       not: "feed",
    //     },
    //   },
    // })
    const tags = await db.query.tag.findMany({
      where: (tag, { not, eq }) => not(eq(tag.slug, "feed"))
    })

    const tagsWithPostCount = tags
      ? await Promise.all(
        tags.map(async (tagItem) => {
          // FIXME: Remove this block as needed
          // const count = await prisma?.post.count({
          //   where: {
          //     tags: {
          //       some: {
          //         id: tag.id,
          //       },
          //       none: {
          //         slug: "feed",
          //       },
          //     },
          //   },
          // })

          const subQueryTags = db.select({ id: tag.id })
            .from(tag)
            .where(and(
              not(eq(tag.slug, 'feed')),
              eq(tag.id, tagItem.id)
            ))
            .as('subQuery');

          const subQueryPostTags = db.select({ postId: postTags.postId })
            .from(postTags)
            .where(inArray(postTags.tagId, subQueryTags.id))
            .as('subQuery')

          const postCountResult = await db
            .select({ count: count() })
            .from(post)
            .where(eq(post.id, subQueryPostTags.postId))

          const postCount: number = postCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

          return {
            ...tagItem,
            postCount,
          }
        })
      )
      : []

    if (!user) {
      redirect("/login")
    }

    if (user.role !== "ADMIN") {
      throw new Error("You are not authorized to access this page.")
    }

    return (
      <div className="flex h-screen pb-20 md:pb-0">
        <div className="hidden md:flex">
          <Sidebar
            siteTitle={settings?.siteTitle!}
            memberCount={memberCount!.length}
            tags={tagsWithPostCount}
            open={false}
            user={user}
          />
        </div>
        <div className="flex md:hidden">
          <MobileNavBar user={user} />
        </div>
        <div className="flex min-w-0 flex-1">
          <div className="ml-20 hidden md:block">
            <AdminSidebar />
          </div>
          <main className="flex flex-col w-0 flex-1 overflow-hidden">
            <div className="border-b border-b-border-subtle flex items-center">
              <div className="px-4 py-6">
                <Breadcrumbs
                  ignore={[
                    { href: "/posts/*/comments", breadcrumb: "Comments" },
                  ]}
                />
              </div>
            </div>
            <div className="overflow-auto">{children}</div>
          </main>
        </div>
        <ToastProvider />
      </div>
    )
  })

  router.createLayout("/*", async ({ children }) => {
    //FIXME: Remove this block as needed
    // const settings = await prisma?.globalSetting.findFirst({
    //   include: {
    //     features: true,
    //   },
    // })
    const settings = await db.query.globalSetting.findFirst({
      with: {
        features: true
      }
    })

    const user = await getCurrentUser()
    let inventory: InferSelectModel<typeof schema.inventory> | null = null
    if (user) {
      inventory = await getUserInventory({
        userId: user.id,
      })
    }

    //FIXME: Remove this block as needed
    // const memberCount = await prisma?.user.findMany()
    const memberCount = await db.query.user.findMany()
    
    // const tags = await prisma?.tag.findMany({
    //   where: {
    //     slug: {
    //       not: "feed",
    //     },
    //   },
    // })

     //FIXME: Remove this block as needed
    const tags = await db.query.tag.findMany({
      where: (tag, { not, eq }) => not(eq(tag.slug, "feed"))
    })

    const tagsWithPostCount = tags
      ? await Promise.all(
        tags.map(async (tagItem) => {
          
          //FIXME: Remove this block as needed
          // const count = await prisma?.post.count({
          //   where: {
          //     tags: {
          //       some: {
          //         id: tag.id,
          //       },
          //       none: {
          //         slug: "feed",
          //       },
          //     },
          //   },
          // })

          const subQueryTags = db.select({ id: tag.id })
          .from(tag)
          .where(and(
            not(eq(tag.slug, 'feed')),
            eq(tag.id, tagItem.id)
          ))
          .as('subQuery');

        const subQueryPostTags = db.select({ postId: postTags.postId })
          .from(postTags)
          .where(inArray(postTags.tagId, subQueryTags.id))
          .as('subQuery')

        const postCountResult = await db
          .select({ count: count() })
          .from(post)
          .where(eq(post.id, subQueryPostTags.postId))

          return {
            ...tagItem,
            postCount: count ?? 0,
          }
        })
      )
      : []

    return (
      <div className="flex h-screen pb-20 md:pb-0">
        <div className="hidden md:flex md:flex-shrink-0">
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
        <div className="md:hidden flex">
          <MobileNavBar user={user} />
        </div>
        <main className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="border-b border-b-border-subtle flex items-center">
            <div className="px-4 py-6">
              <Breadcrumbs
                ignore={[{ href: "/posts/*/comments", breadcrumb: "Comments" }]}
              />
            </div>
          </div>
          <div className="overflow-auto">{children}</div>
        </main>
        <ToastProvider />
      </div>
    )
  })

  router.addRoute("/", async () => {
    redirect("/feed")
  })

  router.addRoute(
    "/feed",
    async () => {
      return <FeedScreen />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Feed",
      })
  )

  router.addRoute(
    "/posts",
    async () => {
      return <AllPosts />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Posts",
      })
  )

  router.addRoute(
    "/posts/:slug",
    async ({ slug }) => {
      const currentUser = await getCurrentUser()
      const post = await getSinglePost({ slug: slug })

      if (!post) {
        redirect("/404")
      }

      return <SinglePost post={post} loggedIn={currentUser ? true : false} />
    },
    "page",
    async (params) => {
      const post = await getSinglePost({ slug: params.slug })
      return preFilledMetadata({
        pageTitle: post?.title as string,
        author: post?.user.username,
      })
    }
  )

  router.addRoute(
    "/posts/:slug/comments/:commentId",
    async ({ slug, commentId }) => {
      const comment = await getComment({ commentId: commentId })
      if (!comment) {
        redirect("/404")
      }

      return <SingleCommentScreen postSlug={slug} comment={comment} />
    },
    "page",
    async (params) => {
      const comment = await getComment({ commentId: params.commentId }) as any
      const post = await getSinglePost({ slug: params.slug })
      return preFilledMetadata({
        pageTitle: `Comment on ${post?.title}`,
        author: comment.user.username,
      })
    }
  )

  router.addRoute(
    "/posts/:slug/comments/:commentId/edit",
    async ({ commentId }) => {
      return <EditComment commentId={commentId} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `Edit Comment - ${params.slug}`,
      })
  )

  router.addRoute(
    "/profile/:username",
    async ({ username }) => {
      return <ProfileScreen username={username} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `${params.username} Profile`,
      })
  )

  router.addRoute(
    "/settings",
    async () => {
      return <UserSettingsScreen />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Settings",
      })
  )

  router.addRoute(
    "/settings/inventory",
    async () => {
      return <UserInventoryScreen />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Inventory",
      })
  )

  router.addRoute(
    "/settings/invites",
    async () => {
      return <UserInviteSettings />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Invite",
      })
  )

  router.addRoute(
    "/posts/new",
    async () => {
      const session = await auth.getSession()
      if (!session) {
        redirect("/login")
      }

      return <NewPost />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "New Post",
      })
  )

  router.addRoute(
    "/posts/:slug/edit",
    async ({ slug }) => {
      const session = await auth.getSession()
      if (!session) {
        redirect("/login")
      }

      return <EditPost slug={slug} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `Edit Post - ${params.slug}`,
      })
  )

  router.addRoute(
    "/shop",
    async () => {
      return <ShopPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Shop",
      })
  )

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
    )
  })

  router.createLayout("/signup", async ({ children }) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    )
  })

  router.createLayout("/forgot-password", async ({ children }) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    )
  })

  router.createLayout("/reset-password", async ({ children }) => {
    return (
      <div className="min-h-screen flex">
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </div>
    )
  })

  // AUTH ROUTES

  router.addRoute(
    "/login",
    async () => {
      return <LoginPage auth={auth} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Login",
      })
  )

  router.addRoute(
    "/signup",
    async () => {
      // FIXME: Remove this block as needed
      // const signupFlow = await prisma?.featureToggle.findFirst({
      //   where: {
      //     feature: "signupFlow",
      //   },
      // })
      const signupFlow = await db.query.featureToggle.findFirst({
        where: (toggle, { eq }) => eq(toggle.feature, "signupFlow")
      })

      if (signupFlow?.value === "closed") {
        return <ClosedSignupPage />
      }

      if (signupFlow?.value === "invite") {
        return <InviteSignupPage />
      }

      return <SignupPage searchParams={searchParams} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Signup",
      })
  )

  router.addRoute(
    "/forgot-password",
    async () => {
      return <ForgotPasswordPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Forgot Password",
      })
  )

  router.addRoute(
    "/reset-password",
    async () => {
      return <ResetPasswordPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Reset Password",
      })
  )

  /**
   *
   *
   *
   * END AUTH
   *
   *
   **/

  router.addRoute(
    "/admin",
    async () => {
      return <AdminMenu />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin",
      })
  )

  router.addRoute(
    "/admin/site",
    async () => {
      return <AdminSiteSettings />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - General",
      })
  )

  router.addRoute(
    "/admin/categories",
    async () => {
      return <AllCategoriesPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - Categories",
      })
  )

  router.addRoute(
    "/admin/categories/new",
    async () => {
      return <NewCategoryPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - New Category",
      })
  )

  router.addRoute(
    "/admin/categories/:id",
    async ({ id }) => {
      return <SingleCategoryPage id={id} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `Admin - Category ${params.id}`,
      })
  )

  router.addRoute(
    "/admin/items",
    async () => {
      return <AllItemsPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - Items",
      })
  )

  router.addRoute(
    "/admin/items/new",
    async () => {
      return <NewItemPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - New Item",
      })
  )

  router.addRoute(
    "/admin/items/:id",
    async ({ id }) => {
      return <SingleItemPage id={id} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `Admin - Item ${params.id}`,
      })
  )

  router.addRoute(
    "/admin/actions",
    async () => {
      return <AllActionsPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - Actions",
      })
  )

  router.addRoute(
    "/admin/actions/new",
    async () => {
      return <NewActionPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - New Action",
      })
  )

  router.addRoute(
    "/admin/actions/:id",
    async ({ id }) => {
      return <SingleActionPage id={id} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `Admin - Action ${params.id}`,
      })
  )

  router.addRoute(
    "/admin/badges",
    async () => {
      return <AllBadgesPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - Badges",
      })
  )

  router.addRoute(
    "/admin/badges/new",
    async () => {
      return <NewBadgePage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - New Badge",
      })
  )

  router.addRoute(
    "/admin/badges/:id",
    async ({ id }) => {
      return <SingleBadgePage id={id} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `Admin - Badge ${params.id}`,
      })
  )

  router.addRoute(
    "/admin/users",
    async () => {
      return <UsersAdminPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - Users",
      })
  )

  router.addRoute(
    "/admin/users/:id",
    async (params) => {
      return <SingleUserAdminPage id={params.id} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `Admin - User ${params.id}`,
      })
  )

  router.addRoute(
    "/admin/broadcasts",
    async () => {
      return <BroadcastsIndex />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - Broadcasts",
      })
  )

  router.addRoute(
    "/admin/lists",
    async () => {
      return <AllListsPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - Lists",
      })
  )

  router.addRoute(
    "/admin/lists/:slug",
    async (params) => {
      return <SingleListPage slug={params.slug} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `Admin - List ${params.slug}`,
      })
  )

  router.addRoute(
    "/admin/lists/new",
    async () => {
      return <NewListPage />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: "Admin - New List",
      })
  )

  router.addRoute(
    "/admin/lists/:slug/edit",
    async (params) => {
      return <EditListPage slug={params.slug} />
    },
    "page",
    async (params) =>
      preFilledMetadata({
        pageTitle: `Admin - Edit List ${params.slug}`,
      })
  )

  router.addRoute(
    "/unsubscribe",
    async (_, request) => {
      return Unsubscribe(request!)
    },
    "api:GET"
  )

  router.addRoute(
    "/activateAccount",
    async (_, request) => {
      return VerifyUser(request!)
    },
    "api:GET"
  )

  router.addRoute(
    "/auth/google",
    async (_, request) => {
      return OAuthLogin(request!, "google", auth)
    },
    "api:GET"
  )

  router.addRoute(
    "/auth/github",
    async (_, request) => {
      return OAuthLogin(request!, "github", auth)
    },
    "api:GET"
  )

  router.addRoute(
    "/files/upload",
    async (_, request) => {
      const user = await getCurrentUser()

      if (!user) {
        throw new Error("You are not authorized")
      }
      return UploadFileRoute(request!)
    },
    "api:POST"
  )

  router.addRoute(
    "/ographimage",
    async (_, request) => {
      return ographImageGenerator(request!)
    },
    "api:GET"
  )

  return router.init(getParams)
}

export async function LayoutInit({
  children,
  params,
}: {
  children: React.ReactNode
  params: { router: string[] }
}) {
  return await router.initLayout({ children, pathArray: params.router })
}

export async function ApiRouteInit() {
  const routes = router.initApiRoute()
  return routes
}
