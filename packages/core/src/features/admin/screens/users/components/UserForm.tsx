"use client"

import { Form, RadioGroupField, TextField } from "../../../../../components/Forms"
import { type UpdateUserSchema } from "../../../../../features/auth/schemas"
import {type z} from 'zod'
import { toast } from "sonner"
import { updateUser } from "../../../actions"
import { useRouter } from "next/navigation"

const UserForm = ({user}: {user: z.infer<typeof UpdateUserSchema>}) => {
  const router = useRouter()

  return (
    <Form 
    submitText="Update" 
    initialValues={{...user}} 
    onSubmit={async (values) => {
      toast.promise(
        new Promise(async (resolve) => {
          await updateUser(values)
          router.push("/admin/users")
          router.refresh()
          resolve(null)
        }),
        {
          loading: 'Updating user...',
          success: 'User updated successfully!',
          error: (error) => `Error updating user: ${error.message}`
        }
      )
    }}
  >
    <TextField name="id" label="Id" disabled />
    <TextField name="email" label="Email" disabled />
    <TextField name="createdAt" label="Created At" disabled />
    <RadioGroupField label="Role" name="role" options={["ADMIN", "USER"]} />
  </Form>
  )
}

export default UserForm