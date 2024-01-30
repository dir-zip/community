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
      title: {
        default: null,
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {}
          }
          return { 'title': attributes.title }
        },
      },
      url: {
        default: null,
        parseHTML: element => element.getAttribute('url'),
        renderHTML: attributes => {
          if (!attributes.url) {
            return {}
          }
          return { 'url': attributes.url }
        },
      },
      createdBy: {
        default: null,
        parseHTML: element => element.getAttribute('createdBy'),
        renderHTML: attributes => {
          if (!attributes.createdBy) {
            return {}
          }
          return { 'createdBy': attributes.createdBy }
        },
      },
      createdByAvatar: {
        default: null,
        parseHTML: element => element.getAttribute('createdByAvatar'),
        renderHTML: attributes => {
          if (!attributes.createdByAvatar) {
            return {}
          }
          return { 'createdByAvatar': attributes.createdByAvatar }
        },
      }
    };
  },
  renderHTML: ({node, HTMLAttributes }) => {
    console.log(node)
    return [
      'div',
      { class: 'post-mention bg-primary-400 rounded text-link p-4 mt-2 flex justify-between w-96 flex-col gap-8' },
      [
        'a',
        { href: HTMLAttributes.url, class: 'text-link text-2xl font-bold' },
        HTMLAttributes.title
      ],
      [
        'span',
        { class: 'flex gap-4 items-center' },
        [
          'img',
          { src: HTMLAttributes.createdByAvatar, class: 'rounded-full w-12 rounded-full', style: 'border-radius:9999px; padding:0;'},
        ],
        [
          'a', // Link tag for createdBy
          { href: `/profile/${HTMLAttributes.createdBy}`, class: 'text-link' }, 
          ` By ${HTMLAttributes.createdBy}`
        ]
      ],
      
    ];
  },
  parseHTML: () => [
    {
      tag: 'div.post-mention',
      getAttrs: dom => {
        const element = dom as HTMLElement;
        const a = element.querySelector('a.text-link.text-2xl.font-bold');
        const img = element.querySelector('img');
        const createdByLink = element.querySelector('a.text-link:not(.text-2xl)'); // Assuming the createdBy link is the only other link
  
        return {
          title: a ? a.textContent : null,
          url: a ? a.getAttribute('href') : null,
          createdBy: createdByLink ? createdByLink.textContent?.trim().substring(3) : null, // Remove the " By " prefix
          createdByAvatar: img ? img.getAttribute('src') : null,
        }
      }
    }
  ]
});


export const PostSelectList = ({editor, range, onChange}: {editor: Editor, range: Range, onChange: () => void}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localPosts, setLocalPosts] = useState<ExtendedPost[]>([])
  const [count, setCount] = useState<number>(0)
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState<string | undefined>()

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getAllPosts({skip: (page) * pageSize, take: pageSize, title: searchQuery})
      setCount(posts.count)
      setLocalPosts(posts.posts)
    }
    fetchPosts()
  }, [searchQuery, page, pageSize])

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
          url: `/posts/${post?.slug}`,
          createdBy: post?.user.username,
          createdByAvatar: post?.user.avatar
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
        <InputField name='search' placeholder='Search' onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery}/>
        {localPosts.map((c, index) => {
          return (
            <div className={`flex items-center justify-between cursor-pointer rounded px-4 py-2 ${index === selectedIndex ? 'bg-primary-900' : ''}`} onClick={() => selectPost(index)} key={index}>
              <span className="text-sm font-medium">{c.title}</span>
              <span className="text-xs">By {c.user.username}</span>
            </div>
          )
        })}
      </DialogContent>
    </Dialog>



  )
}



