"use client";

import { RichTextField, Avatar } from "@dir/ui";
import { Controller, useForm } from "react-hook-form";
import { Form } from "~/components/Forms";

export const FeedInput = ({ avatar, username }: { avatar: string, username: string }) => {
  const {
    control,
  } = useForm();

  return (
    <div className="flex w-full space-x-4">
      <Avatar imageUrl={avatar} fallback={username} />

      <Form
        onSubmit={async (data) => {
          console.log(data)
        }}
        className="w-full flex flex-col space-y-2 items-end"
        submitText="Post"
      >
        <Controller
          name={'feedInput'}
          control={control}
          render={({ field }) => (
            <RichTextField value={field.value} onValueChange={(e) => field.onChange(e)} />
          )}
        />

      </Form>
    </div>
  )
}
