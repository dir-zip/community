"use client"

import { Form, SelectField, TextField } from "~/components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"


import { createList, updateList } from "../actions"
import type { List } from "packages/db"



export const ListForm = ({ list }: { list?: List}) => {
  const router = useRouter();

  return (
    <div className="bg-primary-800 p-6 rounded-lg border border-border-subtle w-full">
      <Form
        submitText={list ? "Update" : "Create"}
        initialValues={list && {
          ...list
        }}
        onSubmit={async (values) => {
          toast.promise(
            new Promise(async (resolve) => {

              if (!list) {
                await createList(values)
              } else {
                await updateList({
                  slug: list.slug,
                  data: {
                    ...values
                  }
    
                })
              }


              router.push(`/admin/lists`)
              router.refresh()
              resolve(null)
            }),
            {
              loading: `${list ? "Updating" : "Creating"} list...`,
              success: `List ${list ? "updated" : "created"} successfully!`,
              error: (error) => `Error ${list ? "updating" : "creating"} list: ${error.message}`
            }
          )
        }}
      >
        <TextField name="title" label="Title" />
        <div className="bg-border-subtle w-full h-px" />

      </Form>
    </div>
  )
}
