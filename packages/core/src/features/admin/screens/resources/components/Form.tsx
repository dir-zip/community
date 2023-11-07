"use client"

import { Form, TextField } from "@/components/Forms"
import {z} from 'zod'
import { toast } from "sonner"
import { updateResource } from "../../../actions"
import { useRouter } from "next/navigation"
import { ResourceSchema } from "../../../../../index"

const ResourceForm = ({resource, schema, resourceRoot}: {resource: {[key:string]: any}, schema: ResourceSchema, resourceRoot: string}) => {
  const router = useRouter()

  const getSchemaInputs = (schema: ResourceSchema) => {
    for(const s of schema) {
      if(s.type === "text") {
        return <TextField name={s.accessorKey} label={s.id} />
      }
    }
  }

  return (
    <Form
    submitText="Update"
    initialValues={{
      ...schema
      .filter(s => s.accessorKey !== 'id')
      .reduce((acc: { [key: string]: any }, s: { type: string; accessorKey: string; id: string; }) => ({ ...acc, [s.accessorKey]: resource[s.accessorKey] }), {}),
      id: resource?.id,
    }}
    onSubmit={async (values) => {
      toast.promise(
        new Promise(async (resolve) => {
          await updateResource({
            resource: resourceRoot,
            id: values['id'],
            data: values
          })
          router.push(`/admin/${resourceRoot}`)
          router.refresh()
          resolve(null)
        }),
        {
          loading: `Updating ${resource}...`,
          success: `${resource} updated successfully!`,
          error: (error) => `Error updating membership: ${error.message}`
        }
      )
    }}
  >
    <TextField name="id" label="Id" disabled />
    {getSchemaInputs(schema)}
  </Form>
  )
}

export default ResourceForm