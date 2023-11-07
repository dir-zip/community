import { getSingleSession } from "../../../actions"

import SessionForm from "../components/SessionForm"


const SingleSessionAdminPage = async ({id}: {id: string}) => {
  const session = await getSingleSession({ id: decodeURIComponent(id) })
  if(!session) {
    throw new Error("Session not found")
  }
  return (
    <SessionForm session={session} />
  )
}

export default SingleSessionAdminPage