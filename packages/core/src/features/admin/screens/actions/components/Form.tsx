"use client"

import { Form, TextField } from "@/components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"


import { createAction, updateAction } from "../actions"
import type { Action } from "packages/db"
import { CreateActionSchema } from "../schema"


export const ActionForm = ({action}: {action?: Action}) => {
  const router = useRouter()



  return (
    <Form
    submitText={action ? "Update" : "Create"}
    schema={CreateActionSchema}
    initialValues={action && {
      ...action
    }}
    onSubmit={async (values) => {
      toast.promise(
        new Promise(async (resolve) => {

          if(!action) {
            await createAction(values)
          } else {
            await updateAction({
              id: action.id,
              ...values
            })
          }


          router.push(`/admin/actions`)
          router.refresh()
          resolve(null)
        }),
        {
          loading: `${action ? "Updating" : "Creating"} action...`,
          success: `Action ${action ? "updated" : "created"} successfully!`,
          error: (error) => `Error ${action ? "updating" : "creating"} Action: ${error.message}`
        }
      )
    }}
  >
    <TextField name="title" label="Title"/>
    <TextField type="number" name="value" label="Value" />

  </Form>
  )
}
