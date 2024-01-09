"use client"

import { Form, TextField } from "../../../../../components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { CreateBroadcastSchema } from "../../../../../features/broadcasts/schemas"
import { createBroadcast, updateBroadcast } from "../actions"
import { Broadcast, Tag } from "packages/db"

export const BroadcastForm = ({ broadcast }: { broadcast?: Broadcast & { tags: Tag[] } }) => {
  const router = useRouter()



  return (
    <Form
      submitText={broadcast ? "Update" : "Create"}
      schema={CreateBroadcastSchema}
      initialValues={broadcast && {
        title: broadcast?.title,
        tags: broadcast.tags.map(p => p.slug).join(', '),
        body: broadcast.body
      }}
      onSubmit={async (values) => {
        toast.promise(
          new Promise(async (resolve) => {
            if (broadcast) {
              await updateBroadcast({ id: broadcast.id, data: values })
            } else {
              await createBroadcast({
                ...values
              })
            }

            router.push(`/admin/broadcasts`)
            router.refresh()
            resolve(null)
          }),
          {
            loading: `${broadcast ? "Updating" : "Creating"} broadcast...`,
            success: `Broadcast ${broadcast ? "updated" : "created"} successfully!`,
            error: (error) => `Error ${broadcast ? "updating" : "creating"} Broadcast: ${error.message}`
          }
        )
      }}
    >
      <TextField name="title" label="Title" />
      <TextField name="tags" label="Tags" />
    </Form>
  )
}
