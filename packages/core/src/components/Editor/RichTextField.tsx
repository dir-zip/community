"use client"
import React, { useEffect, useRef } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
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
import { EditorImageUpload, imageUploadPluginKey } from './plugins/Image'
import { Command, suggestion } from './plugins/Command'
import {  PostMentionNode } from './plugins/PostMention'



const lowlight = createLowlight(common)
lowlight.register('html', html)
lowlight.register('ts', ts)
lowlight.register('js', js)
lowlight.register('css', css)

export const RichTextField = (
  { value, placeholder, onValueChange, editable = true, imageUploadUrl, onImageRemove }:
    { value: string, onValueChange?: (e: string) => void, editable?: boolean, placeholder?: string, imageUploadUrl?: string, onImageRemove?: (images: string[]) => Promise<void> }
) => {

  const editorRef = useRef<Editor | null>(null);


  useEffect(() => {
    if (value === null && editorRef.current) {
      editorRef.current.commands.setContent('');
    }
  }, [value]);

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
      }),
      EditorImageUpload.configure({
        uploadUrl: imageUploadUrl,
        removeImage: onImageRemove
      }),
      Command.configure({
        suggestion: suggestion
      }),
      PostMentionNode
    ],
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
    editable,
    content: value,
    onUpdate({ editor }) {
      const imageUploadState = imageUploadPluginKey.getState(editor.state);

      if(imageUploadState.removedImages && imageUploadState.removedImages.length > 0) {
        onImageRemove!(imageUploadState.removedImages)
      }
      onValueChange!(editor.getHTML())
      editorRef.current = editor as Editor;
    }
  })

  return (
    <EditorContent editor={editor} style={{ minHeight: editable ? '4rem' : 'auto' }} className={cn(editable && "flex rounded-md border w-full bg-primary-900 antialiased px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50")} />
  )
}
