import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { Editor } from '@tiptap/core'
import { Range } from '@tiptap/core'
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance, Props } from "tippy.js";

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