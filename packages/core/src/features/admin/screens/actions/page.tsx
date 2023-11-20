
import {Suspense} from 'react'
import {ActionForm} from './components/Form'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/Button'
import { getSingleAction } from './actions'
import { ActionsTable } from './components/ActionsTable'


export const AllActionsPage = async () => {
  return (
    <div>
      <div className="flex justify-between items-center pb-4">
        <h3 className="text-xl font-bold">Actions</h3>
        <Link className={cn(
          buttonVariants({ variant: "default", size: "sm" })
        )} href="/admin/actions/new">New</Link>
      </div>
      <Suspense>
          <ActionsTable />
      </Suspense>
    </div>
  )
}

export const NewActionPage = async () => {
  return (
    <div>
      <h3 className="text-xl font-bold pb-4">New Action</h3>
      <Suspense>
        <ActionForm />
     </Suspense>
    </div>
  )
}

export const SingleActionPage = async ({id}: {id: string}) => {
  const action = await getSingleAction({ id: id })
  if(!action) {
    throw new Error("Action not found")
  }
  return (
    <div>
      <ActionForm action={action}/>
    </div>
  )
}

