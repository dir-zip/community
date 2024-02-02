"use client"

import { User } from "@dir/db"
import { toast } from "sonner"
import { Form } from "~/components/Forms"
import SingleFileUploadField from "~/features/files/components/SingleFileUpload"
import { updateUser } from "../actions"
import { UserWithInventory } from "~/lib/types"

export const AccountForm = ({currentUser}: {currentUser: UserWithInventory | null}) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold">Account</h3>
        <p className="antialiased text-sm">Manage your account settings</p>
      </div>
      <Form 
        className="w-full flex flex-col gap-4 items-end"
        initialValues={{
          avatar: currentUser?.avatar
        }} 
        onSubmit={async (values) => {
        toast.promise(
          new Promise(async (resolve) => {
            await updateUser({avatar: values.avatar, userId: currentUser?.id!})
            resolve(null);
          }),
          {
            loading: "Updating account...",
            success: "Account updated!",
            error: (error) => `Error updating account: ${error.message}`,
          },
        );
      }} submitText="Update">
        <SingleFileUploadField name="avatar" label="Avatar" acceptedFileTypes={['png', 'image/jpg']}/>
      </Form>
    </div>
  )
}