"use client"

import { Form, SelectField, TextField } from "~/components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { PostSchema } from "~/features/posts/schemas"
import { createPost, updatePost } from "../actions"
import { Category, Tag, type Post } from "packages/db"
import { FancyEditorField } from "~/components/Forms/FancyEditorField"
import { TagField } from "~/components/Forms/TagField"


const PostForm = ({ post, categories }: { post?: Post & { tags: Tag[], category: Category }, categories: Category[] }) => {
  const router = useRouter()

  return (
    <div className="bg-primary-800 p-6 rounded-lg border border-border-subtle w-full">
      <Form
        submitText={post ? "Update" : "Post"}
        // schema={PostSchema}
        initialValues={post && {
          title: post.title,
          body: post.body,
          category: post.category.slug,
          tags: post.tags.map(p => p.slug)
        }}
        onSubmit={async (values) => {
          toast.promise(
            new Promise(async (resolve) => {
              if (!post) {
                console.log(values)
                const post = await createPost({
                  ...values
                })
                router.push(`/posts/${post.slug}`)
              } else {
                const updatedPost = await updatePost({
                  slug: post.slug,
                  data: {
                    ...values
                  }
                })

                router.push(`/posts/${updatedPost.slug}`)
              }


           
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
        <div className="bg-primary-900 w-full h-px" />
        <SelectField label="Category" name="category" options={categories.map((c) => {
          return { value: c.slug, key: c.title }
        })} />
              <div className="bg-primary-900 w-full h-px" />
        <TagField name="tags" label="Tags" />
        <div className="bg-primary-900 w-full h-px" />
        <FancyEditorField name="body" label="Body" />
      </Form>
    </div>
  )
}

export default PostForm
