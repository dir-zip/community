"use client";

import { RichTextField, Avatar } from "@dir/ui";
import { Controller, useFormContext } from "react-hook-form";
import { Form } from "~/components/Forms";
import { createPost } from "~/features/posts/actions";

const InputField = () => {
  const {
    control,
  } = useFormContext();

  return (
    <Controller
      name={'feedInput'}
      control={control}
      render={({ field }) => (
        <RichTextField value={field.value} placeholder="Write something spectacular..." onValueChange={(e) => field.onChange(e)} />
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
          createPost({
            title: '',
            body: data.feedInput,
            tags: 'feed',
            category: 'general'
          })
        }}
        initialValues={{ feedInput: null }}
        className="w-full flex flex-col space-y-2 items-end"
        submitText="Post"
      >
        <InputField />
      </Form>
    </div>
  )
}
