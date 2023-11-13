import { redirect } from "next/navigation"
import { getUser } from "./actions"
import Link from "next/link"

export const ProfileScreen = async ({username}: {username: string}) => {
  const user = await getUser({username})
  if (!user) {
    return redirect('/404')
  }
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
    </div>
  )
}