import { Node } from '@tiptap/core'
import { NodeType } from '@tiptap/pm/model';
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      /**
       * Insert an image at the current position or a specific position.
       */
      insertImage: (options: { src: string, alt?: string, title?: string }) => ReturnType,
    }
  }
}




export const EditorImageUpload = Node.create(({
  name: 'imageUpload',
  inline: true,
  group: 'inline',
  draggable: true,
  addOptions() {
    return {
      ...this.parent?.(),
      uploadUrl: ""
    }
  },
  addAttributes: () => ({
    src: {},
    title: {
      default: null
    },
    alt: {
      default: null
    }
  }),
  renderHTML: ({ HTMLAttributes }) => ['img', HTMLAttributes],
  parseHTML: () => [
    {
      tag: 'img[src]',
      getAttrs: (dom) => {
        const element = dom as HTMLImageElement
        return {
          src: element.getAttribute('src'),
          title: element.getAttribute('title'),
          alt: element.getAttribute('alt')
        }
      }
    }
  ],
  commands({ type }: {type: NodeType}) {
    return {
      insertImage: (attributes: { src: string }) => {
        return (state: EditorState, dispatch: (tr: Transaction) => void) => {
          let position = state.selection.$from.pos;
          if (state.selection instanceof TextSelection) {
            if (state.selection.$cursor) {
              position = state.selection.$cursor.pos;
            }
          } 
  
          const node = type.create(attributes);
          const transaction = state.tr.insert(position, node);
          if (dispatch) {
            dispatch(transaction);
          }
          return true;
        };
      }
    };
  },
  addProseMirrorPlugins() {
    const plugin = new Plugin({
      key: new PluginKey('imageUpload'),
      props: {
        handleDOMEvents: {
          drop: (view, event) => {
            const hasFiles = event.dataTransfer && event.dataTransfer.files.length

            if (!hasFiles) {
              return false
            }

            event.preventDefault()

            const images = Array.from(event.dataTransfer.files)
              .filter(file => /image/i.test(file.type))

            if (images.length === 0) {
              return false
            }

            images.forEach(async (image) => {
              try {
                const formData = new FormData();
                formData.append('file', image); // 'file' is the key your server expects
            
                // Upload the image file
                const uploadResponse = await fetch(this.options.uploadUrl, {
                  method: "POST",
                  body: formData // Send the FormData object
                });
                const res = await uploadResponse.json();
    
        
                const { tr } = view.state;
        
                const imageNodeType = tr.doc.type.schema.nodes.imageUpload;
                if (!imageNodeType) {
                  console.error('Image node type is not defined in the schema.');
                  return;
                }
                const imageNode = imageNodeType.create({ src: res.location });
                tr.replaceSelectionWith(imageNode);
                view.dispatch(tr);
              } catch (error) {
                console.error('Error uploading image:', error);
              }
            })

            return true
          },
        },
      },
    })

    return [plugin]
  },
}))

