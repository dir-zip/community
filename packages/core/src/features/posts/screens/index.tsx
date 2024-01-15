import { getAllPosts } from "../actions"
import { PostList } from "../components/PostList"
export const AllPosts = async () => {
  const categories = await getAllPosts()

  return (
    <div className="p-6">
      <PostList posts={categories} />
    </div>
  )
}
