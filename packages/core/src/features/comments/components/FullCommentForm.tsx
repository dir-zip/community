"use client"
import { Form } from "~/components/Forms/Form"
import { Comment } from '@dir/db/drizzle/types'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { FancyEditorField } from "~/components/Forms/FancyEditorField"
import { updateComment } from "../actions"

export const FullCommentForm = ({ comment, postSlug }: { comment: Comment, postSlug: string }) => {
  const router = useRouter()
  return (
    <div className="bg-primary-800 p-6 rounded-lg border border-border-subtle w-full">
      <Form
        submitText={comment ? "Update" : "Create"}
        className="w-full flex flex-col gap-8 items-end"
        initialValues={comment && {
          body: comment.body,
        }}
        onSubmit={async (values) => {
          toast.promise(
            new Promise(async (resolve) => {
              await updateComment({ id: comment.id, data: { body: values.body } })

              router.push(`/posts/${postSlug}/comments/${comment.id}`)
              resolve(null)
            }),
            {
              loading: `${comment ? "Updating" : "Creating"} comment...`,
              success: `Comment ${comment ? "updated" : "created"} successfully!`,
              error: (error) => `Error ${comment ? "updating" : "creating"} Comment: ${error.message}`
            }
          )
        }}
      >

        <div className="w-full flex flex-col gap-1">
          <FancyEditorField name="body" label="Body" />
        </div>
      </Form>
    </div>
  )
}

