import { getAllPosts } from "../actions"
import { PostList } from "../components/PostList"
export const AllPosts = async () => {
  const categories = await getAllPosts({skip: 0, take: 10})

  return (
    <div className="p-6">
      <PostList posts={categories} />
    </div>
  )
}
