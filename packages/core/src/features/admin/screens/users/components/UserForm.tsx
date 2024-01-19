"use client"

import { Form, TextField } from "~/components/Forms"
import { type UpdateUserSchema } from "~/features/auth/schemas"
import { type z } from 'zod'
import { toast } from "sonner"
import { updateUser } from "../../../actions"
import { useRouter } from "next/navigation"

const UserForm = ({ user }: { user: z.infer<typeof UpdateUserSchema> }) => {
  const router = useRouter()

  return (
    <div className="bg-primary-800 p-6 rounded-lg border border-border-subtle w-full">
      <Form
        submitText="Update"
        initialValues={{ ...user }}
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
        <div className="bg-border-subtle w-full h-px" />
        <TextField name="username" label="Username" disabled />
        <div className="bg-border-subtle w-full h-px" />
        <TextField name="email" label="Email" disabled />
        <div className="bg-border-subtle w-full h-px" />
        <TextField name="createdAt" label="Created At" disabled />
        <div className="bg-border-subtle w-full h-px" />
        <TextField name="points" label="Points" type="number" />
      </Form>
    </div>
  )
}

export default UserForm
