import { Divider } from "@/components/Divider"
import { FeedInput } from "../components/FeedInput"
import { FeedList } from "../components/FeedList"

import { Suspense } from 'react'
import { getCurrentUser } from "~/features/auth/actions"
import { getAllPosts } from "~/features/posts/actions"


export const FeedScreen = async () => {

  const currentUser = await getCurrentUser()
  const posts = await getAllPosts({skip: 0, take: 40})

  return (
    <div className="xl:mx-auto xl:w-[960px]">


      <div className="flex items-center gap-20 justify-center p-6 flex-col">
{      currentUser ?  <Suspense>
          <div className="w-full pt-20">
            <FeedInput user={currentUser} posts={posts.posts}/>
          </div>
        </Suspense> : null}
        <Divider component={() => {
          return (
            <div className="px-4">
              <span className="inline-block transform -translate-y-0.5 px-0.5 bg-clip-text text-transparent font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                L
              </span>
              <span className="inline-block bg-clip-text text-transparent px-0.5 bg-gradient-to-r font-bold from-yellow-400 via-red-500 to-pink-500">
                a
              </span>
              <span className="inline-block transform -translate-y-0.5 bg-clip-text px-0.5 font-bold text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                t
              </span>
              <span className="inline-block transform bg-clip-text px-0.5 font-bold text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                e
              </span>
              <span className="inline-block transform -translate-y-0.5 bg-clip-text px-0.5 font-bold text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                s
              </span>
              <span className="inline-block transform bg-clip-text px-0.5 font-bold text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                t
              </span>
            </div>
          )
        }} />
        <Suspense>
          <FeedList currentUser={currentUser} />
        </Suspense>
      </div>
    </div>
  )
}
