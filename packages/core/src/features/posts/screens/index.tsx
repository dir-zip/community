import Link from "next/link"
import { getAllPosts } from "../actions"
import { Button, PostPreview } from '@dir/ui'
import { TestTable } from "../components/TestTable"
import { Divider } from '@/components/Divider'

export const AllPosts = async ({ loggedIn }: { loggedIn: boolean }) => {
  const categories = await getAllPosts()

  return (
    <div className="px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Posts</h2>
        <Button>Test</Button>
      </div>

      <div className="py-4">
        <TestTable />
      </div>

      <PostPreview content="Test" />
      <Divider text="Test" />

      <div>
        {categories.map((c, i) => {
          return (
            <div key={i}>
              <div className="py-4">
                <h3 className="text-xl font">{c.title}</h3>
              </div>
              {c.posts.map((p, i) => {
                return (
                  <div key={i}>
                    <Link href={`/posts/${p.slug}`}><p>{p.title}</p></Link>
                    <Link href={`/profile/${p.user.username}`}><p>{p.user.username}</p></Link>
                    <p>{p.createdAt.toDateString()}</p>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
