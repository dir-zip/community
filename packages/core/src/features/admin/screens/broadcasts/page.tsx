
import {Suspense} from 'react'
import {BroadcastForm} from './components/Form'
import Link from 'next/link'
import { BroadcastTable } from './components/BroadcastTable'
import { getSingleBroadcast } from './actions'
import { cn } from '@/utils'
import { buttonVariants } from '@/components/Button'

export const AllBroadcasts = async () => {
  return (
    <div>
      <div className="flex justify-between items-center pb-4">
        <h3 className="text-xl font-bold">Broadcasts</h3>
        <Link className={cn(
          buttonVariants({ variant: "default" })
        )} href="/admin/broadcasts/new">New</Link>
      </div>
      <Suspense>
        <BroadcastTable />
      </Suspense>
    </div>
  )
}

export const NewBroadcastPage = async () => {
  return (
    <div>
      <h3 className="text-xl font-bold pb-4">New Broadcast</h3>
      <Suspense>
      <BroadcastForm />
     </Suspense>
    </div>
  )
}

export const SingleBroadcastPage = async ({slug}: {slug: string}) => {
  const broadcast = await getSingleBroadcast({ slug: slug })
  if(!broadcast) {
    throw new Error("Broadcast not found")
  }
  return (
    <div>
      <BroadcastForm broadcast={broadcast}/>
    </div>
  )
}

