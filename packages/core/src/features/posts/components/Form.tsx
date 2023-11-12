"use client"

import { Form, SelectField, TextField } from "@/components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { PostSchema } from "@/features/posts/schemas"
import { createPost } from "../actions"
import { Category, type Post } from "packages/db"

const PostForm = ({post, categories}: {post?: Post, categories: Category[]}) => {
  const router = useRouter()

  return (
    <Form
    submitText={post ? "Update" : "Create"}
    schema={PostSchema}
    onSubmit={async (values) => {
      toast.promise(
        new Promise(async (resolve) => {
          await createPost({
            ...values
          })

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
    <TextField name="title" label="Title"/>
    <SelectField label="Category" name="category" options={categories.map((c) => {
      return {value: c.slug, key: c.title}
    })}/>
    <TextField name="body" label="Body" />
  </Form>
  )
}

export default PostForm