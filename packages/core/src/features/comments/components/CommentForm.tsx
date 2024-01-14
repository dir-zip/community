"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Form, TextField } from "../../../components/Forms";
import { createComment } from "../../posts/actions";
import { CommentSchema } from "../schemas";
import { Avatar, RichTextField } from "@dir/ui";



const InputField = () => {
  const {
    control,
  } = useFormContext();

  return (
    <Controller
      name={'body'}
      control={control}
      render={({ field }) => (
        <RichTextField value={field.value} placeholder="Write something spectacular..." onValueChange={(e) => field.onChange(e)} />
      )}
    />
  )
}


export const CommentForm = ({ postSlug, parentId }: { postSlug: string, parentId: string | null }) => {
  return (
    <div className="flex w-full space-x-4 pl-8">
      <div className="flex flex-col items-center gap-2">
        <Avatar imageUrl={""} fallback={"dillonraphael"} />
      </div>
      <Form
        submitText="Post"
        reset={true}
        initialValues={{ body: null }}
        className="w-full flex flex-col space-y-2 items-end"
        onSubmit={async (data) => {
          try {
            await createComment({ postSlug, body: data.body, parentId });
          } catch (err: any) {
            console.log(err);
          }
        }}
      >
        <InputField />
      </Form>
    </div>
  )
}
