import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { Editor } from '@tiptap/core'
import { Range } from '@tiptap/core'
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance, Props } from "tippy.js";
import { TextSelection } from '@tiptap/pm/state';

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

            <div>
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
        title: 'H1',
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
        title: 'H2',
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
        title: 'H3',
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
        title: 'Post',
        command: ({ editor, range }: { editor: Editor, range: Range }) => {
          editor.chain().focus().deleteRange(range).run();

          const comp = new ReactRenderer(() => {
            const [selectedIndex, setSelectedIndex] = React.useState(0);
            const containerRef = React.useRef<HTMLDivElement>(null);

            const posts = [{ title: "test 1", url: "x.com" }, { title: 'test2', url: 'x.com' }];

            React.useEffect(() => {
              if (containerRef.current) {
                containerRef.current.focus();
              }
            }, []);
            

            const selectPost = (index: number) => {
              const post = posts[index];
              const adjustedRange = { ...range, from: range.from - 1, to: range.to + 1 };
              editor
                .chain()
                .focus()
                .deleteRange(adjustedRange)
                .insertContent({ type: 'paragraph' })
                .insertContent({
                  type: 'postMention',
                  attrs: post
                })
                .insertContent({ type: 'paragraph' })
                // Move the cursor to the new block if necessary
                .command(({ tr, state }) => {
                  const { doc, selection } = state;
                  const position = selection.$head.after();
                  const endOfDoc = doc.content.size;
                  if (position < endOfDoc) {
                    tr.setSelection(TextSelection.near(tr.doc.resolve(position + 1)));
                  }
                  return true;
                })
                .run();

              
              comp.destroy()
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
              <div ref={containerRef} className='fixed top-1/2 left-1/2 bg-primary-800 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded shadow-md' >
                <h2>Post Details</h2>
                {posts.map((c, index) => {
                  return (
                    <div className={`flex items-center space-x-2 cursor-pointer ${index === selectedIndex ? 'bg-blue-500' : ''}`} onClick={() => selectPost(index)} key={index}>
                      <p>{c.title}</p>
                      <p>{c.url}</p>
                    </div>
                  )
                })}
              </div>
            )
          }, {
            editor: editor,
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

        const hidePopupListener = () => {
          popup?.[0]?.hide();
        };
        document.addEventListener('hideCommandListPopup', hidePopupListener);

        // Cleanup listener on exit
        return () => {
          document.removeEventListener('hideCommandListPopup', hidePopupListener);
        };
      },

      onUpdate(props: SuggestionProps) {
        component?.updateProps(props);
        popup &&
          popup[0]?.setProps({
            getReferenceClientRect: props.clientRect,
          });
      },

      onKeyDown(props: SuggestionProps) {
        const componentWithKeyDown = component as ReactRendererWithKeyDown;

        if (props.event.key === "Escape") {
          popup?.[0]?.hide();
          return true;
        }

        if (props.event.key === "Enter") {
          props.event.preventDefault();
          return true;
        }


        return componentWithKeyDown.ref?.onKeyDown(props);
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    }
  },
}