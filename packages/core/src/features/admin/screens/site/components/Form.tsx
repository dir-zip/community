"use client";

import { Form, SwitchField, TextField } from "~/components/Forms";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { GlobalSetting, FeatureToggle } from "packages/db";
import { updateSiteSettings } from "../../../actions";
import TextFieldWithAddon from "~/components/Forms/TextFieldWithAddon";

export const SiteForm = ({
  site,
}: {
  site: GlobalSetting & { features: FeatureToggle[] };
}) => {
  const router = useRouter();

  const isPrivate = site.features.find(
    (f) => f.feature === "private",
  )!.isActive;

  return (
    <div className="bg-primary-800 p-6 rounded-lg border border-border-subtle w-full">
      <Form
        submitText={"Save"}
        initialValues={{
          siteTitle: site.siteTitle,
          isPrivate: isPrivate,
          broadcastPin: site.features.find((f) => f.feature === "broadcastPin")!
            .value,
        }}
        onSubmit={async (values) => {
          toast.promise(
            new Promise(async (resolve) => {
              try {
                await updateSiteSettings({ ...values });
                router.refresh();
                resolve(null);
              } catch (err) {
                console.log(err);
              }
            }),
            {
              loading: `Updating site...`,
              success: `Site updated successfully!`,
              error: (error) => `Error updating site: ${error.message}`,
            },
          );
        }}
      >
        <TextField
          name="siteTitle"
          label="Site Title"
          description="The title of your site"
        />
        <div className="bg-border-subtle w-full h-px" />
        <SwitchField
          name="isPrivate"
          label="Private"
          description="Require an account to view posts"
        />
        <div className="bg-border-subtle w-full h-px" />
        <TextFieldWithAddon
          inputWidth="12rem"
          name="broadcastPin"
          label="Pin broadcasts"
          addon="days"
          description="How long to keep broadcasts at the top of the feed"
          type="number"
        />
      </Form>
    </div>
  );
};