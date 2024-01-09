"use client";

import { Form, TextField } from "../../../components/Forms";
import { createComment } from "../../posts/actions";
import { CommentSchema } from "../schemas";



export const CommentForm = ({ postSlug, parentId }: { postSlug: string, parentId: string | null }) => {
  return (
    <div>
      <Form
        submitText="Post"
        schema={CommentSchema}
        reset={true}
        onSubmit={async (data) => {
          try {
            await createComment({ postSlug, body: data.body, parentId });
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
