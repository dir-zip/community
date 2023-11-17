"use client"

import { Form, TextField } from "@/components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"


import { createItem, updateItem } from "../actions"
import type { Item } from "packages/db"
import { CreateItemSchema } from "../schema"

export const ItemForm = ({item}: {item?: Item}) => {
  const router = useRouter()



  return (
    <Form
    submitText={item ? "Update" : "Create"}
    schema={CreateItemSchema}
    initialValues={item && {
      ...item
    }}
    onSubmit={async (values) => {
      toast.promise(
        new Promise(async (resolve) => {

          if(!item) {
            await createItem(values)
          } else {
            await updateItem({
              id: item.id,
              ...values
            })
          }


          router.push(`/admin/items`)
          router.refresh()
          resolve(null)
        }),
        {
          loading: `${item ? "Updating" : "Creating"} item...`,
          success: `Item ${item ? "updated" : "created"} successfully!`,
          error: (error) => `Error ${item ? "updating" : "creating"} Item: ${error.message}`
        }
      )
    }}
  >
    <TextField name="title" label="Title"/>
    <TextField name="description" label="Description" />
    <TextField type="number" name="price" label="Price" />
  </Form>
  )
}
