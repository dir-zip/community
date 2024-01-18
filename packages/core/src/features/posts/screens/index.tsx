import { getAllPosts } from "../actions"
import { PostList } from "../components/PostList"
export const AllPosts = async () => {
  const categories = await getAllPosts({ skip: 0, take: 10 })

  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6">
        <PostList posts={categories} />
      </div>
    </div>
  )
}
