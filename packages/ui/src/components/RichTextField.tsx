import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { cn } from '@/utils'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github.css';
import Placeholder from '@tiptap/extension-placeholder'

const lowlight = createLowlight(common)
lowlight.register('html', html)
lowlight.register('ts', ts)
lowlight.register('js', js)
lowlight.register('css', css)

export const RichTextField = ({ value, placeholder, onValueChange, editable = true }: { value: string, onValueChange?: (e: string) => void, editable?: boolean, placeholder?: string }) => {


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        codeBlock: false,
      }),
      TextStyle,
      CodeBlockLowlight
        .configure({ lowlight }),
      Placeholder.configure({
        placeholder: placeholder
      })
    ],
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
    editable,
    content: value,
    onUpdate({ editor }) {
      onValueChange!(editor.getHTML())
    }
  })

  return (
    <EditorContent editor={editor} style={{ minHeight: '4rem' }} className={cn(editable && "flex rounded-md border w-full bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50")} />
  )
}
