import { buttonVariants } from "@/components/Button"
import { cn } from "@/utils"
import Link from "next/link"
import { Suspense } from "react"
import { ListTable } from "./components/ListsTable"
import { SingleListTable } from "./components/SingleListTable"
import { getSingleList } from "./actions"
import { ListForm } from "./components/Form"

export const AllListsPage = async () => {
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Lists</h2>
            <Link
              className={cn(buttonVariants({ variant: "default" }))}
              href="/admin/lists/new"
            >
              New
            </Link>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <ListTable />
        </Suspense>
      </div>
    </div>
  )
}

export const SingleListPage = async ({ slug }: { slug: string }) => {
  const list = await getSingleList({ slug: slug })
  if (!list) {
    throw new Error("List not found")
  }
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Edit {list.title}</h2>
            <Link
              className={cn(buttonVariants({ variant: "default" }))}
              href={`/admin/lists/${slug}?open=true`}
            >
              Add User
            </Link>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <SingleListTable slug={slug} />
        </Suspense>
      </div>
    </div>
  )
}

export const NewListPage = async () => {
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">New List</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <ListForm />
        </Suspense>
      </div>
    </div>
  )
}

export const EditListPage = async ({ slug }: { slug: string }) => {
  const list = await getSingleList({ slug: slug })
  if (!list) {
    throw new Error("List not found")
  }
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Edit List</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <ListForm list={list} />
        </Suspense>
      </div>
    </div>
  )
}
