"use client";

import { RichTextField, Avatar } from "@dir/ui";
import { Controller, useFormContext } from "react-hook-form";
import { Form } from "~/components/Forms";

const InputField = () => {
  const {
    control,
  } = useFormContext();

  return (
    <Controller
    name={'feedInput'}
    control={control}
    render={({ field }) => (
      <RichTextField value={field.value} onValueChange={(e) => field.onChange(e)} />
    )}
  />
  )
}

export const FeedInput = ({ avatar, username }: { avatar: string, username: string }) => {
  return (
    <div className="flex w-full space-x-4">
      <Avatar imageUrl={avatar} fallback={username} />

      <Form
        onSubmit={async (data) => {
          console.log(data)
        }}
        initialValues={{ feedInput: '' }}
        className="w-full flex flex-col space-y-2 items-end"
        submitText="Post"
      >
        <InputField />
      </Form>
    </div>
  )
}
