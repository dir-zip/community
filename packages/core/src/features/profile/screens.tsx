import { redirect } from "next/navigation"
import { getInventory, getUser } from "./actions"
import Link from "next/link"

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

      <div>
        <h3 className="font-bold text-lg">Badges</h3>
        {inventory?.collection.filter(t => t.type === "BADGE").map((item, i) => {
          return (
            <div key={i} className="border border-slate-400 w-fit p-4">
              <img src={item.badge?.image as string} className="w-20 h-20"/>
              <p>{item.badge?.title}</p>
            </div>
          )
        })}
      </div>

      <div>
        <h3 className="font-bold text-lg">Items</h3>
        {inventory?.collection.filter(t => t.type === "ITEM").map((item, i) => {
          return (
            <div key={i} className="border border-slate-400 w-fit p-4">
              <img src={item.item?.image as string} className="w-20 h-20"/>
              <p>{item.item?.title}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}