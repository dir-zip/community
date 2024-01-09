"use client"
import { PostPreview, Avatar } from "@dir/ui"
export const FeedList = () => {
  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex flex-row space-x-4 w-full">
        <Avatar imageUrl="https://avatars.githubusercontent.com/u/101" fallback="https://avatars.githubusercontent.com/u/101" />
        <PostPreview content="Testing 123 trestsdfs sdfsdfs dfsdf sdf sdfsdf sdf" />
      </div>

      <div className="flex flex-row space-x-4 w-full">
        <Avatar imageUrl="https://avatars.githubusercontent.com/u/101" fallback="https://avatars.githubusercontent.com/u/101" />
        <PostPreview content="Testing 123 trestsdfs sdfsdfs dfsdf sdf sdfsdf sdf" />
      </div>

      <div className="flex flex-row space-x-4 w-full">
        <Avatar imageUrl="https://avatars.githubusercontent.com/u/101" fallback="https://avatars.githubusercontent.com/u/101" />
        <PostPreview content="Testing 123 trestsdfs sdfsdfs dfsdf sdf sdfsdf sdf" />
      </div>

      <div className="flex flex-row space-x-4 w-full">
        <Avatar imageUrl="https://avatars.githubusercontent.com/u/101" fallback="https://avatars.githubusercontent.com/u/101" />
        <PostPreview content="Testing 123 trestsdfs sdfsdfs dfsdf sdf sdfsdf sdf" />
      </div>
      

    </div>
  )
}
