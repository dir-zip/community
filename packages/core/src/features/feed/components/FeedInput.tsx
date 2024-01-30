"use client";

import { Form } from "~/components/Forms";
import { createPost } from "~/features/posts/actions";
import { toast } from "sonner";
import { FancyEditorField } from "~/components/Forms/FancyEditorField";
import { useRouter } from "next/navigation";
import { applyEffects } from "~/itemEffects";
import { UserWithInventory } from "~/lib/types";


export const FeedInput = ({ user }: { user: UserWithInventory }) => {
  const router = useRouter()

  return (
    <div className="flex w-full space-x-4">
      <div>
        {applyEffects('avatar', {username:user.username, avatar:user.avatar || ""}, user.inventory)}
      </div>
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
