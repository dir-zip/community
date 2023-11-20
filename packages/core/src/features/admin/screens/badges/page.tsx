
import {Suspense} from 'react'
import {BadgeForm} from './components/Form'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/Button'
import { getSingleBadge } from './actions'
import { BadgesTable } from './components/BadgesTable'
import { getAllActions } from '../actions/actions'


export const AllBadgesPage = async () => {
  return (
    <div>
      <div className="flex justify-between items-center pb-4">
        <h3 className="text-xl font-bold">Badges</h3>
        <Link className={cn(
          buttonVariants({ variant: "default", size: "sm" })
        )} href="/admin/badges/new">New</Link>
      </div>
      <Suspense>
          <BadgesTable />
      </Suspense>
    </div>
  )
}

export const NewBadgePage = async () => {
  const actions = await getAllActions({skip: 0, take: 10})
  return (
    <div>
      <h3 className="text-xl font-bold pb-4">New Badge</h3>
      <Suspense>
        <BadgeForm actions={actions.actions}/>
     </Suspense>
    </div>
  )
}

export const SingleBadgePage = async ({id}: {id: string}) => {
  const badge = await getSingleBadge({ id: id })
  const actions = await getAllActions({skip: 0, take: 10})
  if(!badge) {
    throw new Error("Badge not found")
  }
  return (
    <div>
      <BadgeForm badge={badge} actions={actions.actions}/>
    </div>
  )
}

