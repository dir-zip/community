"use client"

import { Form, SelectField, TextField } from "~/components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"


import { createItem, updateItem } from "../actions"
import type { Item } from "packages/db/drizzle/types"
import { CreateItemSchema } from "../schema"
import { SingleFileUploadField } from "~/features/files/components/SingleFileUpload"

export const ItemForm = ({ item, effects }: { item?: Item, effects: { key: string, value: string }[] }) => {
  const router = useRouter();



  return (
    <div className="bg-primary-800 p-6 rounded-lg border border-border-subtle w-full">
      <Form
        submitText={item ? "Update" : "Create"}
        schema={CreateItemSchema}
        initialValues={item && {
          ...item
        }}
        onSubmit={async (values) => {
          toast.promise(
            new Promise(async (resolve) => {

              if (!item) {
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
        <TextField name="title" label="Title" />
        <div className="bg-border-subtle w-full h-px" />
        <TextField name="description" label="Description" />
        <div className="bg-border-subtle w-full h-px" />
        <TextField type="number" name="price" label="Price" />
        <div className="bg-border-subtle w-full h-px" />
        <SingleFileUploadField name="image" label="Image" />
        <div className="bg-border-subtle w-full h-px" />
        <SelectField name="effect" label="Effect" options={effects}/>
      </Form>
    </div>
  )
}
