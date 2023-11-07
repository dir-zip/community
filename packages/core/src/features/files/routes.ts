import { type NextRequest } from 'next/server';
import {FileUploader} from "@1upsaas/files"

export const UploadFileRoute = async (request: NextRequest) => {

  const data = await request.formData()
  const getFile = data.get('file')

  const f = new FileUploader({
    allowedFileTypes: ['png', 'jpg'],
    onProgressUpdate: async (progress) => {
      console.log("Progress update:", progress);
    },
    bucket: process.env.S3_BUCKET as string
  })

  try {
    const file = await f.upload(getFile as File)
    return new Response(file, { status: 200 })
  } catch(err) {
    return new Response(null, { status: 500 })
  }
}