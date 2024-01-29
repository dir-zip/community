import { getCategories } from "../actions"
import { PostList } from "../components/PostList"

export const AllPosts = async () => {
  const categories = await getCategories()
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6">
        <PostList categories={categories}/>
      </div>
    </div>
  )
}
