import { redirect } from "next/navigation"
import { getInventory, getUser } from "./actions"
import Link from "next/link"
import { cn } from "~/lib/utils"
import { buttonVariants } from "@/components/Button"
import { InventoryProfile } from "./components/Inventory"

export const ProfileScreen = async ({username}: {username: string}) => {
  const user = await getUser({username})
  if (!user) {
    return redirect('/404')
  }

  const inventory = await getInventory({
    userId: user.id
  })


  return (
    <div>
      <p>{user.username}</p>
      {user.posts.map((post) => {
        return (
          <div key={post.id}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </div>
        )
      })}
      <InventoryProfile inventory={inventory} />
    </div>
  )
}