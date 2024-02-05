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
        className="w-full flex flex-col gap-6 items-end"
        initialValues={{
          avatar: currentUser?.avatar || undefined,
          bannerImage: currentUser?.bannerImage
        }} 
        onSubmit={async (values) => {
        toast.promise(
          new Promise(async (resolve) => {
            await updateUser({avatar: values.avatar, userId: currentUser?.id!, bannerImage: values.bannerImage})
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
        <div className="bg-border-subtle w-full h-px" />
        <SingleFileUploadField name="bannerImage" label="Profile Banner" acceptedFileTypes={['png', 'image/jpg']}/>
      </Form>
    </div>
  )
}