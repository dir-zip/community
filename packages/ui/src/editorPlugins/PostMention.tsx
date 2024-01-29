import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import React, {useEffect, useRef, useState} from 'react'

interface PostMentionProps {
  node: {
    attrs: {
      content: string;
    };
  };
  updateAttributes: (attributes: Record<string, any>) => void;
}

const PostMentionComponent = (props: PostMentionProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const popupRef = useRef(null);
  const items = [
    { title: 'Item 1' },
    { title: 'Item 2' },
    { title: 'Item 3' },
  ];
  const { node, updateAttributes } = props

  useEffect(() => {
    setShowPopup(true)
  }, []);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % items.length);
      } else if (event.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
      } else if (event.key === 'Enter') {
        const selectedItem = items[selectedIndex];
        if (selectedItem !== undefined) {
          handleItemClick(selectedItem.title);
        }
      }
    };

    // Attach the event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener from the document
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPopup, items.length, selectedIndex]);

  const closePopup = () => {
    setShowPopup(false);
    updateAttributes({
      content: props.node.attrs.content + "CLOSED",
    })
  };

  const handleItemClick = (itemTitle: string) => {
    updateAttributes({
      content: itemTitle,
    });
    setShowPopup(false); // Optionally close the popup
  };


  return (
  
    <NodeViewWrapper className="post-mention">
      {showPopup && (
        <div
          className="popup absolute top-0 left-0 bg-primary-800 z-60"
          ref={popupRef}
        >
          <div className="popup-content">
            <button onClick={() => setShowPopup(false)}>Close</button>
            <h2>Posts</h2>
            <ul>
              {items.map((item, index) => (
                <li
                  key={item.title}
                  onClick={() => handleItemClick(item.title)}
                  className={selectedIndex === index ? 'bg-primary-700' : ''}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <span>My custom content: {node.attrs.content}</span>
    </NodeViewWrapper>

  )
}

export const PostMentionNode = Node.create({
  name: 'post-mention',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      content: {
        default: 'Default content',
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'post-mention',
      },
    ]
  },
  renderHTML({ node, HTMLAttributes }) {
    return ['post-mention', mergeAttributes(HTMLAttributes)]
  },
  addNodeView() {
    return ReactNodeViewRenderer(PostMentionComponent)
  },
})