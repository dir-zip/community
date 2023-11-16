"use client";

import { Form, TextField } from "@/components/Forms";
import { createComment } from "../../posts/actions";
import { CommentSchema } from "../schemas";
import { useFormContext } from "react-hook-form";



export const CommentForm = ({postSlug, parentId}: {postSlug: string, parentId: string | null}) => {
  const { reset } = useFormContext();
  return (
    <div>
      <Form
        submitText="Post"
        schema={CommentSchema}
        onSubmit={async (data) => {
          try {
            await createComment({ postSlug, body: data.body, parentId });
            reset()
          } catch (err: any) {
            console.log(err);
          }
        }}
      >
        <TextField label="Comment" name="body" type="text" />
      </Form>
    </div>
  )
}