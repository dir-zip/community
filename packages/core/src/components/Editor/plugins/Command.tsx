"use client"
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { Editor } from '@tiptap/core'
import { Range } from '@tiptap/core'
import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance, Props } from "tippy.js";
import { PostSelectList } from './PostMention';
import {Heading1, Heading2, Heading3, FileText} from 'lucide-react'

interface ReactRendererWithKeyDown extends ReactRenderer {
  ref: {
    onKeyDown: (props: SuggestionProps) => boolean;
  };
}

interface CommandFunctionProps {
  editor: Editor,
  range: Range,
}

interface SuggestionProps {
  clientRect: () => DOMRect,
  command: (props: CommandFunctionProps) => void,
  decorationNode: Element,
  editor: Editor,
  items: Item[],
  event: KeyboardEvent
}

type Item = {
  title: string,
  icon: ReactNode,
  command: (props: CommandFunctionProps) => void
}


export const Command = Extension.create({
  name: 'commandSuggestion',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: Editor, range: Range, props: any }) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<SuggestionProps>({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

const CommandList = ({
  items,
  command,
  editor,
  range,
}: {
  items: Item[];
  command: any;
  editor: any;
  range: any;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandListRef = useRef<HTMLDivElement>(null);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    },
    [command, editor, items]
  );

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();

        if (e.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        } else if (e.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % items.length);
        } else if (e.key === "Enter") {
          selectItem(selectedIndex);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [items, selectedIndex, setSelectedIndex, selectItem]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);


  useEffect(() => {
    const commandListElement = commandListRef.current;
    if (commandListElement) {
      commandListElement.focus();
    }
  }, []);



  return (
    <div
      ref={commandListRef}
      className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-primary-800 px-1 py-2 shadow-md transition-all"
    >
      {items.map((item: Item, index: number) => {
        return (
          <button
            className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-primary-700 ${index === selectedIndex
              ? "bg-primary-900"
              : ""
              }`}
            key={index}
            onClick={() => selectItem(index)}
          >

            <div className="flex gap-4 items-center">
             <span>{item.icon}</span>
              <p className="font-medium">{item.title}</p>
            </div>
          </button>
        );
      })}
    </div>
  )
};


export const suggestion = {
  items: ({ query }: { query: string }): Item[] => {
    return [
      {
        title: 'Heading 1',
        icon: <Heading1 className='w-4 h-4'/>,
        command: ({ editor, range }: { editor: Editor, range: Range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 1 })
            .run()
        },
      },
      {
        title: 'Heading 2',
        icon: <Heading2 className='w-4 h-4'/>,
        command: ({ editor, range }: { editor: Editor, range: Range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 2 })
            .run()
        },
      },
      {
        title: 'Heading 3',
        icon: <Heading3 className='w-4 h-4'/>,
        command: ({ editor, range }: { editor: Editor, range: Range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 3 })
            .run()
        },
      },
      {
        title: 'Mention a post',
        icon: <FileText className='w-4 h-4'/>,
        command: ({ editor, range }: { editor: Editor, range: Range }) => {
          editor.chain().focus().deleteRange(range).run();

          const comp = new ReactRenderer(() => {
            const handleChange = () => {
              comp.destroy()
            }
            return <PostSelectList editor={editor} range={range} onChange={handleChange} />
          }, {
            editor: editor
          });


          document.body.appendChild(comp.element);

          const event = new CustomEvent('hideCommandListPopup');
          document.dispatchEvent(event);



        },
      }
    ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
  },
  render: () => {
    let component: ReactRenderer | null = null;
    let popup: Instance<Props>[] | null = null;
    let isPopupDestroyed = true;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        });


        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
        isPopupDestroyed = false;

      const hidePopupListener = () => {
        if (!isPopupDestroyed) {
          popup?.[0]?.hide();
        }
      };
      document.addEventListener('hideCommandListPopup', hidePopupListener);

      // Cleanup listener on exit
      return () => {
        document.removeEventListener('hideCommandListPopup', hidePopupListener);
      };
      },

      onUpdate(props: SuggestionProps) {
        if (!isPopupDestroyed) { // Check the flag before updating
          component?.updateProps(props);
          popup &&
            popup[0]?.setProps({
              getReferenceClientRect: props.clientRect,
            });
        }
      },

      onKeyDown(props: SuggestionProps) {
        const componentWithKeyDown = component as ReactRendererWithKeyDown;

        if (props.event.key === "Escape") {
          if (!isPopupDestroyed) { // Check the flag before hiding
            popup?.[0]?.hide();
          }
          return true;
        }

        if (props.event.key === "Enter") {
          props.event.preventDefault();
          return true;
        }


        return componentWithKeyDown.ref?.onKeyDown(props);
      },

      onExit() {
        if (!isPopupDestroyed) { // Check the flag before destroying
          popup?.[0]?.destroy();
          component?.destroy();
          isPopupDestroyed = true; // Update the flag after destruction
        }
      },
    }
  },
}