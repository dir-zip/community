"use client";

import { Form, TextField } from "@/components/Forms";
import { createComment } from "../../actions";
import { CommentSchema } from "../../schemas";



export const CommentForm = ({postId}: {postId: string}) => {
  return (
    <div>
      <Form
        submitText="Post"
        schema={CommentSchema}
        onSubmit={async (data) => {
          try {
            await createComment({ postId, body: data.body });
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