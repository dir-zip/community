import { redirect } from "next/navigation"
import { getAllBroadcasts, getSingleBroadcast } from "../admin/screens/broadcasts/actions"
import Link from "next/link"

export const AllBroadcastsPage = async () => {
  const broadcasts = await getAllBroadcasts({skip: 0, take: 100})
  return (
    <div>
      <h2>Broadcasts</h2>
      {broadcasts.broadcasts.map((b, i) => {
        return (
          <div key={i}>
            <Link href={`/broadcasts/${b.slug}`}><p>{b.title}</p></Link>
            <p>{b.createdAt.toDateString()}</p>
            <p>{b.body}</p>
          </div>
        )
      })}
    </div>
  )
}

export const BroadcastPage = async ({slug}: {slug: string}) => {
  const broadcast = await getSingleBroadcast({slug: slug})
  if (!broadcast) {
    throw redirect('/404')
  }
  return (
    <div>
      <h2>{broadcast.title}</h2>
      <p>{broadcast.createdAt.toDateString()}</p>
      <p>{broadcast.body}</p>
    </div>
  )
}