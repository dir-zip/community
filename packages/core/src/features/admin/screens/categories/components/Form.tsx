"use client"

import { Form, TextField } from "@/components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { CategorySchema } from "@/features/posts/schemas"
import { createCategory, updateCategory } from "../actions"
import { Category } from "packages/db"

const CategoryForm = ({category}: {category?: Category}) => {
  const router = useRouter()



  return (
    <Form
    submitText={category ? "Update" : "Create"}
    schema={CategorySchema}
    initialValues={category && {
      title: category?.title
    }}
    onSubmit={async (values) => {
      toast.promise(
        new Promise(async (resolve) => {
          if(category) {
            await updateCategory({id: category.id, data: values})
          } else {
            await createCategory({
              ...values
            })
          }

          router.push(`/admin/categories`)
          router.refresh()
          resolve(null)
        }),
        {
          loading: `${category ? "Updating" : "Creating"} category...`,
          success: `Catgory ${category ? "updated" : "created"} successfully!`,
          error: (error) => `Error ${category ? "updating" : "creating"} Catgory: ${error.message}`
        }
      )
    }}
  >
    <TextField name="title" label="Title"/>
  </Form>
  )
}

export default CategoryForm