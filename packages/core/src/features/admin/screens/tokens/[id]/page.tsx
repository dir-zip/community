import { getSingleToken } from "../../../actions"

import TokenForm from "../components/TokenForm"


const SingleTokenAdminPage = async ({id}: {id: string}) => {
  const token = await getSingleToken({ id: id })
  if(!token) {
    throw new Error("Token not found")
  }
  return (
    <TokenForm token={token} />
  )
}

export default SingleTokenAdminPage