"use client"
import { InputField } from '@/components/InputField';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/primitives/dialog-primitive';
import {  Editor, Node, Range } from '@tiptap/core'
import React, { useEffect, useRef, useState } from 'react';


export const PostMentionNode = Node.create({
  name: 'postMention',
  inline: true,
  group: 'inline',
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      posts: {
        default: []
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {}
          }

          return {
            'title': attributes.title,
          }
        },
      },
      url: {
        default: null,
        parseHTML: element => element.getAttribute('data-url'),
        renderHTML: attributes => {
          if (!attributes.url) {
            return {}
          }

          return {
            'url': attributes.url,
          }
        },
      },
    };
  },
  renderHTML: ({node, HTMLAttributes }) => {
    return [
      'div', // Parent div tag
      { class: 'bg-primary-800 text-link p-2 mt-2 flex' }, // Attributes for the div
      [
        'a',
        { ...HTMLAttributes, href: HTMLAttributes.url, class: 'your-custom-class-name' }, // The a tag inside the div
        HTMLAttributes.title
      ]
    ];
  },
  parseHTML: () => [
    {
      tag: 'a',
      getAttrs: (dom) => {
        const element = dom as HTMLImageElement
        return {
          title: element.getAttribute('title'),
          url: element.getAttribute('url')
        }
      }
    },
  ]
});


export const PostSelectList = ({editor, range, onChange}: {editor: Editor, range: Range, onChange: () => void}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const posts = [{ title: "test 1", url: "x.com" }, { title: 'test2', url: 'x.com' }];

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);


  const selectPost = (index: number) => {
    const post = posts[index];
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertContent({
        type: 'postMention',
        attrs: post
      })
      .enter()
      .run();

      onChange()
  };

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();

        if (e.key === "ArrowUp") {
          e.preventDefault(); // Prevent scrolling
          setSelectedIndex((prevIndex) => (prevIndex - 1 + posts.length) % posts.length);
        } else if (e.key === "ArrowDown") {
          e.preventDefault(); // Prevent scrolling
          setSelectedIndex((prevIndex) => (prevIndex + 1) % posts.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          selectPost(selectedIndex);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, setSelectedIndex, selectPost]);


  return (
    <Dialog defaultOpen={true} onOpenChange={(open) => {
      if (!open) {
        editor.commands.focus()
        onChange()
      }
    }}>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mention a post</DialogTitle>
        </DialogHeader>
        <InputField name='search' placeholder='Search'/>
        {posts.map((c, index) => {
          return (
            <div className={`flex items-center space-x-2 cursor-pointer rounded px-4 py-2 ${index === selectedIndex ? 'bg-primary-900' : ''}`} onClick={() => selectPost(index)} key={index}>
              <p>{c.title}</p>
              <p>{c.url}</p>
            </div>
          )
        })}
      </DialogContent>
    </Dialog>



  )
}



