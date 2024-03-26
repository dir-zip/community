import { Comments } from "~/features/comments/screens"
import { getSinglePost } from "../actions"
import { redirect } from "next/navigation"

import { Suspense } from "react"
import Link from "next/link"
import { checkGuard } from "~/features/auth/actions"
import { Divider } from "@dir/ui"
import { RichTextField } from "~/components/Editor/RichTextField"
import { PenSquare } from "lucide-react"
import { applyEffects } from "~/itemEffects"
import { Post, PostTag, Tag } from "packages/db/drizzle/types"
import { UserWithInventory } from "~/lib/types"
export const SinglePost = async ({
  loggedIn,
  post,
}: {
  loggedIn: boolean
  post: Post & { user: UserWithInventory; tags: (PostTag & { tag: Tag })[] }
}) => {
  let can = false
  if (loggedIn) {
    can = await checkGuard({ rule: ["UPDATE", "post", post.slug] })
  }

  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="flex items-center gap-8 justify-center p-4 md:p-6 flex-col">
        <div className="flex gap-8 w-full">
          <div className="flex flex-col items-center gap-2">
            {applyEffects(
              "avatar",
              { avatar: post.user.avatar || "", username: post.user.username },
              post.user.inventory
            )}
            <Link href={`/profile/${post.user.username}`}>
              {applyEffects(
                "username",
                { username: post.user.username },
                post.user.inventory
              )}
            </Link>
          </div>
          <div className="w-full bg-primary-900 rounded p-4 md:p-6 border-border-subtle">
            <RichTextField
              value={post.body}
              editable={false}
              onValueChange={undefined}
            />
            <div className="w-full flex justify-end">
              {loggedIn && can && (
                <Link href={`/posts/${post.slug}/edit`}>
                  <PenSquare className="text-link w-4 cursor-pointer h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <Divider text="Comments" />

        <Suspense fallback={<div>Loading...</div>}>
          <Comments postSlug={post.slug} />
        </Suspense>
      </div>
    </div>
  )
}
