"use client"

import { Form, RadioGroupField, TextField } from "../../../components/Forms"

import { toast } from "sonner"
import { useRouter } from "next/navigation"


import { GlobalSetting, FeatureToggle } from "packages/db"
import { updateSiteSettings } from "../actions"

export const SiteForm = ({ site }: { site: GlobalSetting & { features: FeatureToggle[] } }) => {
  const router = useRouter()

  const isPrivate = site.features.find(f => f.feature === 'private')!.isActive

  return (
    <Form
      submitText={"Save"}
      initialValues={{
        siteTitle: site.siteTitle,
        isPrivate: isPrivate ? "true" : "false"
      }}
      onSubmit={async (values) => {
        toast.promise(
          new Promise(async (resolve) => {

            try {
              await updateSiteSettings({ ...values })
              router.refresh()
              resolve(null)
            } catch (err) {
              console.log(err)
            }

          }),
          {
            loading: `Updating site...`,
            success: `Site updated successfully!`,
            error: (error) => `Error updating site: ${error.message}`
          }
        )
      }}
    >
      <TextField name="siteTitle" label="Site Title" />
      <RadioGroupField name="isPrivate" label="Private" options={['true', 'false']} />
    </Form>
  )
}
