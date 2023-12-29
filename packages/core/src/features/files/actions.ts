"use server";

import {FileUploader} from "@dir/files"

export const remove = async ({ key }: {key: string}) => {

  const f = new FileUploader({
    bucket: process.env.S3_BUCKET as string
  })

  try {
    await f.delete(key)
  } catch (error) {
    throw new Error(String(error))
  }


}