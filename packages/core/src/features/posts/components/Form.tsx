"use client"

import { Form, SelectField, TextField } from "~/components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { PostSchema } from "~/features/posts/schemas"
import { createPost, updatePost } from "../actions"
import { Category, Tag, type Post } from "packages/db"
import { FancyEditorField } from "~/components/Forms/FancyEditorField"


const PostForm = ({ post, categories }: { post?: Post & { tags: Tag[], category: Category }, categories: Category[] }) => {
  const router = useRouter()

  return (
    <div className="bg-primary-800 p-6 rounded-lg border border-border-subtle w-full">
      <Form
        submitText={post ? "Update" : "Create"}
        schema={PostSchema}
        className="w-full flex flex-col gap-8 items-end"
        initialValues={post && {
          title: post.title,
          body: post.body,
          category: post.category.slug,
          tags: post.tags.map(p => p.slug).join(', ')
        }}
        onSubmit={async (values) => {
          toast.promise(
            new Promise(async (resolve) => {
              if (!post) {
                await createPost({
                  ...values
                })
              } else {
                await updatePost({
                  slug: post.slug,
                  data: {
                    ...values,
                  }
                })
              }


              router.push(`/`)
              router.refresh()
              resolve(null)
            }),
            {
              loading: `${post ? "Updating" : "Creating"} post...`,
              success: `Post ${post ? "updated" : "created"} successfully!`,
              error: (error) => `Error ${post ? "updating" : "creating"} Post: ${error.message}`
            }
          )
        }}
      >
        <TextField name="title" label="Title" />
        <SelectField label="Category" name="category" options={categories.map((c) => {
          return { value: c.slug, key: c.title }
        })} />
        <TextField name="tags" label="Tags" />
        <div className="w-full flex flex-col gap-1">
          <span className="text-sm">Body</span>
          <FancyEditorField name="body" />
        </div>
      </Form>
    </div>
  )
}

export default PostForm
