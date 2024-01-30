"use client"
import { InputField, Dialog, DialogContent, DialogHeader, DialogTitle } from '@dir/ui';
import {  Editor, Node, Range } from '@tiptap/core'
import React, { useEffect, useRef, useState } from 'react';
import { getAllPosts } from '~/features/posts/actions';
import { ExtendedPost } from '~/features/posts/components/PostList';


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
  const [localPosts, setLocalPosts] = useState<ExtendedPost[]>([])


  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getAllPosts({skip: 0, take: 40})
      setLocalPosts(posts.posts)
    }
    fetchPosts()
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);


  const selectPost = (index: number) => {
    const post = localPosts[index];
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertContent({
        type: 'postMention',
        attrs: {
          title: post?.title,
          url: `/posts/${post?.slug}`
        }
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
          setSelectedIndex((prevIndex) => (prevIndex - 1 + localPosts.length) % localPosts.length);
        } else if (e.key === "ArrowDown") {
          e.preventDefault(); // Prevent scrolling
          setSelectedIndex((prevIndex) => (prevIndex + 1) % localPosts.length);
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
        {localPosts.map((c, index) => {
          return (
            <div className={`flex items-center space-x-2 cursor-pointer rounded px-4 py-2 ${index === selectedIndex ? 'bg-primary-900' : ''}`} onClick={() => selectPost(index)} key={index}>
              <p>{c.title}</p>
              <p>{c.slug}</p>
            </div>
          )
        })}
      </DialogContent>
    </Dialog>



  )
}



