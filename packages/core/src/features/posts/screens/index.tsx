import Link from "next/link"
import { getAllPosts } from "../actions"
import { Button, PostPreview } from '@dir/ui'
import { TestTable } from "../components/TestTable"
import { Divider } from '@/components/Divider'

export const AllPosts = async ({ loggedIn }: { loggedIn: boolean }) => {
  const categories = await getAllPosts()

  return (
    <div className="px-4">
    </div>
  )
}
