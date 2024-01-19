"use client";

import { Avatar } from "@dir/ui";
import { Form } from "~/components/Forms";
import { createPost } from "~/features/posts/actions";
import { toast } from "sonner";
import { FancyEditorField } from "~/components/Forms/FancyEditorField";
import { useRouter } from "next/navigation";

export const FeedInput = ({ avatar, username }: { avatar: string, username: string }) => {
  const router = useRouter()
  return (
    <div className="flex w-full space-x-4">
      <Avatar imageUrl={avatar} fallback={username} />

      <Form
        reset={true}
        onSubmit={async (data) => {
          toast.promise(
            new Promise(async (resolve) => {
              createPost({
                title: '',
                body: data.feedInput,
                tags: ['feed'],
                category: 'general'
              })
              router.push(`/feed?lastUpdated=${encodeURIComponent(new Date().toISOString())}`)
              resolve(null);
            }),
            {
              loading: "Posting...",
              success: "Your post is now live",
              error: (error) => `Error posting: ${error.message}`,
            },
          );
        }}
        initialValues={{ feedInput: null }}
        className="w-full flex flex-col space-y-2 items-end"
        submitText="Post"
      >
        <FancyEditorField name="feedInput" />
      </Form>
    </div>
  )
}
