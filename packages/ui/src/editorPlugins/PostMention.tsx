"use client"
import {  Node } from '@tiptap/core'


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
      { class: 'bg-primary-800 text-link p-2 my-2' }, // Attributes for the div
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




