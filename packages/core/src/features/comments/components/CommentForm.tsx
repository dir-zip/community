"use client";

import { applyEffects } from "~/itemEffects";
import { Form } from "../../../components/Forms";
import { createComment } from "../../posts/actions";
import { CommentSchema } from "../schemas";
import { Avatar } from "@dir/ui";
import { FancyEditorField } from "~/components/Forms/FancyEditorField";
import { UserWithInventory } from "~/lib/types";





export const CommentForm = ({ postSlug, parentId, user }: { postSlug: string, parentId: string | null, user: UserWithInventory }) => {
  return (
    <div className="flex w-full space-x-4 pl-8">
      <div className="flex flex-col items-center gap-2">
        {applyEffects('avatar', {avatar: user.avatar || "", username: user.username}, user.inventory)} 
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
        <FancyEditorField name="body" />
      </Form>
    </div>
  )
}
