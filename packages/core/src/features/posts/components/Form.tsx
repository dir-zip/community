"use client"

import { Form, SelectField, SwitchField, TextField } from "~/components/Forms"
import {useEffect, useState} from 'react'
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { PostSchema } from "~/features/posts/schemas"
import { createPost, updatePost } from "../actions"
import { Category, Tag, type Post, List } from "packages/db"
import { FancyEditorField } from "~/components/Forms/FancyEditorField"
import { TagField } from "~/components/Forms/TagField"
import { Megaphone } from 'lucide-react'
import { getAllLists } from "~/features/admin/screens/lists/actions"
import CheckboxArrayField from "~/components/Forms/CheckboxArrayField"

const PostForm = ({ post, categories, canCreateBroadcast }: { post?: Post & { tags: Tag[], category: Category }, categories: Category[], canCreateBroadcast?: boolean }) => {
  const router = useRouter()
  const can = canCreateBroadcast || false
  const [lists, setLists] = useState<List[]>([]);
  const [toggle, setToggle] = useState(false)

  useEffect(() => {
    const getLists = async () => {
      const lists = await getAllLists({skip: 0, take: 40, where: {
        slug: {
          not: {
            equals: 'unsubscribed'
          }
        }
      }})
      setLists(lists.lists)
    }
    getLists()
  }, []);


  return (
    <div className="bg-primary-800 p-6 rounded-lg border border-border-subtle w-full">
      <Form
        submitText={post ? "Update" : "Post"}
        schema={PostSchema}
        initialValues={post && {
          title: post.title,
          body: post.body,
          category: post.category.slug,
          tags: post.tags.map(p => p.slug)
        }}
        onSubmit={async (values) => {
          toast.promise(
            new Promise(async (resolve) => {
              if (!post) {
                const post = await createPost({
                  ...values,
                  broadcast: values.broadcast,
                  broadcastToList: values.broadcastToList
                })
                router.push(`/posts/${post.slug}`)
              } else {
                const updatedPost = await updatePost({
                  slug: post.slug,
                  data: {
                    ...values
                  }
                })

                router.push(`/posts/${updatedPost.slug}`)
              }

              router.refresh()
              resolve(null)
            }),
            {
              loading: `${post ? "Updating" : "Creating"} post...`,
              success: `Post ${post ? "updated" : "created"} successfully!`,
              error: (error) => `Error ${post ? "updating" : "creating"} Post: ${error.message}`
            }
          )
        }}
      >
        <TextField name="title" label="Title" />
        <div className="bg-border-subtle w-full h-px" />
        <SelectField label="Category" name="category" options={categories.map((c) => {
          return { value: c.slug, key: c.title }
        })} />
        {can ? <div className="flex flex-col w-full gap-6">
          <div className="bg-border-subtle w-full h-px" />
          <div className="flex flex-col bg-primary-700 gap-4 py-4 px-3 rounded w-full -mb-5">
            <Megaphone className="w-6 h-6 self-start  stroke-primary-100 -rotate-12" />
            <SwitchField name="broadcast" label="Broadcast" onSwitchChange={(value) => {
              setToggle(value)
            }} />
            {toggle ? <div className="flex flex-col gap-4 py-4">
              <CheckboxArrayField name="broadcastToList" label="Select a list" data={lists.map(list => ({value: list.slug, key: list.title}))}/>
            </div> : null}
          </div>
        </div> : null}
        <div className="bg-border-subtle w-full h-px" />
        <TagField name="tags" label="Tags" />
        <div className="bg-border-subtle w-full h-px" />
        <FancyEditorField name="body" label="Body" />
      </Form>
    </div>
  )
}

export default PostForm
