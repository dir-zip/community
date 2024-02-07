import { getSingleUser } from "../../../actions"
import {Suspense} from 'react'
import UserForm from "../components/UserForm"


const SingleUserAdminPage = async ({id}: {id: string}) => {
  const user = await getSingleUser({ id})
  if(!user) {
    throw new Error("User not found")
  }
  return (
    <div className="px-4 xl:mx-auto xl:w-[960px]">
    <div className="py-6">

      <div className="flex flex-col gap-4 pb-6">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Edit {user.username}</h2>
        </div>
        <div className="flex w-full items-center justify-center">
          <div className="border-t flex-grow" />
        </div>
      </div>

      <Suspense>
      <UserForm user={user}/>
      </Suspense>

    </div>
  </div>
  )
}

export default SingleUserAdminPage