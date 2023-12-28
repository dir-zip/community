import React from 'react'


export type PostPreviewProps = {
  content: string
}

export const PostPreview = (props: PostPreviewProps) => {
  const {content} = props
  return (
    <div className="bg-primary-800 rounded border px-6 py-4">
      {content}
    </div>
  )
}
