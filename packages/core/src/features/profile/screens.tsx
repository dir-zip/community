import { redirect } from "next/navigation"
import { getUser } from "./actions"

import { Suspense } from 'react'

import { UserPostsList } from "./components/UserPostsList"
import { applyEffects } from "~/itemEffects"
import { getUserInventory } from "../user/actions"
import { getUserBadges } from '../user/actions'

import { HoverCard } from "@dir/ui"

export const ProfileScreen = async ({ username }: { username: string }) => {
  const user = await getUser({ username })
  if (!user) {
    return redirect('/404')
  }

  const inventory = await getUserInventory({
    userId: user.id
  })

  const badges = await getUserBadges({ userId: user.id })

  const usernameWithEffect = applyEffects("username", { username: user.username }, inventory);
  const avatarWithEffect = applyEffects('avatar', { username: user.username, avatar: user.avatar || "", className: "text-5xl w-48 h-48" }, inventory);


  return (

    <div className="pb-8 flex flex-col gap-4">
      {user.bannerImage ? <img
        alt="Header"
        className="h-56 w-full aspect-[3/1] object-cover"
        src={user.bannerImage as string}
      /> : <div className="h-56 w-full bg-primary-800" />}
      <div className="xl:mx-auto xl:w-[960px]">
        <div className="flex relative gap-8 w-full justify-start pl-14 bottom-[100px]">

          {avatarWithEffect}

          <div className="flex flex-col gap-2 bottom-[-120px] relative">
            <div className="rounded px-4 py-2 bg-primary-900">
              <span className="text-lg font-bold">{usernameWithEffect}</span>
            </div>
            <div className="flex">
              <div className="rounded px-4 py-2 bg-primary-900">
                <span>🌐</span>
              </div>
            </div>

          </div>

        </div>

        <div className="flex flex-col gap-24">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">Badges</h3>
            <div className="flex gap-2 py-6 px-4 bg-primary-800 border rounded border-border-subtle">
              {badges?.collection.map(i => {
                return (
                  <HoverCard trigger={ <div className="rounded px-1.5 py-1.5 bg-primary-900 border border-border-subtle">
                  <img src={i.badge?.image!} className="w-8 h-8 rounded" />
                </div>} content={   <span className="text-xs">{i.badge?.title}</span>}/>

                )
              })}

            </div>
          </div>



          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold">Posts</h3>
            <Suspense fallback="Loading...">
              <UserPostsList username={user.username} />
            </Suspense>
          </div>
        </div>

      </div>
      {/* </div> */}
    </div>
  )
}
