import { getFeed } from "../actions"
import { FeedInput } from "../components/FeedInput"
import { FeedList } from "../components/FeedList"

import { Suspense } from 'react'

export const FeedScreen = async () => {
  const feed = await getFeed()
  return (
    <div className="flex items-center space-y-6 justify-center p-6 flex-col">
      <Suspense>
        <FeedInput username="dillonraphael" avatar="" />
      </Suspense>
      <hr className="border w-full" />
      <Suspense>
        <FeedList feed={feed} user={{
        username: 'dillonraphael', 
        avatar: ''
        }} />
      </Suspense>
    </div>
  )
}
