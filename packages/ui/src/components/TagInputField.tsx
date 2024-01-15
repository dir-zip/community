"use client"
import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface TagInputFieldProps {
  onChange: (tags: string[]) => void;
}

export const TagInputField: React.FC<TagInputFieldProps> = ({ onChange }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {

    if (event.key === 'Enter') {
      event.preventDefault()
      if (input) {
        const newTags = [...tags, input];
        setTags(newTags);
        setInput('');
        onChange(newTags);
      }
    } else if (event.key === 'Backspace' && input === '') {
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
      onChange(newTags);
    }
  };

  const handleDelete = (tagToDelete: string) => {
    const newTags = tags.filter((tag) => tag !== tagToDelete);
    setTags(newTags);
    onChange(newTags);
  };

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input !== '') {
      const div = inputRef.current;
      if (div) {
        const range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [input]);


  return (
    <div onClick={() => inputRef.current?.focus()} onTouchEnd={() => inputRef.current?.focus()} className="flex h-full gap-2 items-center cursor-text bg-primary-900 border rounded px-2 py-1">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div key={index} className="bg-primary-400 text-xs h-[24px] border border-border rounded items-center gap-2 px-2 flex">
            {tag}
            <button onClick={(e) => { e.stopPropagation(); handleDelete(tag); }} onTouchEnd={(e) => { e.stopPropagation(); handleDelete(tag); }} className="text-sm"><X className="w-3 h-3 text-link" /></button>
          </div>
        ))}

        <div
          ref={inputRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Tag input field"
          suppressContentEditableWarning
          onInput={(e) => setInput((e.target as HTMLDivElement).textContent || '')}
          onKeyDown={handleKeyDown}
          className="bg-transparent flex items-center outline-none text-sm"
        >
          {input}
        </div>
      </div>
    </div>
  );
};
