import { getSingleUser } from "../../../actions"

import UserForm from "../components/UserForm"


const SingleUserAdminPage = async ({id}: {id: string}) => {
  const user = await getSingleUser({ id})
  if(!user) {
    throw new Error("User not found")
  }
  return (
    <UserForm user={user} />
  )
}

export default SingleUserAdminPage