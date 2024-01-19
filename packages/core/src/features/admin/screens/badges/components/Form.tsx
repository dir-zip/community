"use client"

import { Form, TextField } from "../../../../../components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"


import { createBadge, deleteBadge, updateBadge } from "../actions"
import type { Action, Badge, Condition } from "packages/db"
import { CreateBadgeSchema } from "../schema"
import { ConditionInputField } from "./ConditionInputField"
import SingleFileUploadField from "../../../../../features/files/components/SingleFileUpload"
import { cn } from "@/utils"
import { buttonVariants } from "@/components/Button"

export const BadgeForm = ({badge, actions}: {badge?: Badge & {condition: (Condition & {actions: Action[]}) | null}, actions: Action[]}) => {
  const router = useRouter()

  return (
    <div className="bg-primary-800 p-6 rounded-lg border border-border-subtle w-full">
    <Form
    submitText={badge ? "Update" : "Create"}
    schema={CreateBadgeSchema}
    initialValues={badge && {
      ...badge,
      image: badge.image || undefined,
      condition: badge.condition?.actions.map((c) => c.id)
    }}
    onSubmit={async (values) => {

      toast.promise(
        new Promise(async (resolve) => {

          if(!badge) {
            await createBadge(values)
          } else {
            await updateBadge({
              id: badge.id,
              ...values
            })
          }


          router.push(`/admin/badges`)
          router.refresh()
          resolve(null)
        }),
        {
          loading: `${badge ? "Updating" : "Creating"} badge...`,
          success: `Badge ${badge ? "updated" : "created"} successfully!`,
          error: (error) => `Error ${badge ? "updating" : "creating"} Badge: ${error.message}`
        }
      )
    }}
  >
    <TextField name="title" label="Title"/>
    <div className="bg-primary-900 w-full h-px" />
    <TextField name="description" label="Description"/>
    <div className="bg-primary-900 w-full h-px" />
    <SingleFileUploadField name="image" label="Image" />
    <div className="bg-primary-900 w-full h-px" />
    <ConditionInputField name="condition" label="Condition" actions={actions}/>
  </Form>
  </div>
  )
}
