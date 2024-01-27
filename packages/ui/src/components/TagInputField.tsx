"use client"
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface TagInputFieldProps {
  value?: string[]
  onChange: (tags: string[]) => void;
}

export const TagInputField: React.FC<TagInputFieldProps> = forwardRef<HTMLDivElement, TagInputFieldProps>(({ onChange, value: externalTags }, ref) => {
  const [internalTags, setInternalTags] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);


  useEffect(() => {
    setInternalTags(externalTags || []);
  }, [externalTags]);

  const setTags = (newTags: string[]) => {
    onChange(newTags);
    // setInternalTags(newTags);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (input) {
        const newTags = [...internalTags, input];
        setTags(newTags);
        setInput('');
      }
    } else if (event.key === 'Backspace' && input === '') {
      event.preventDefault();
      if (selectedTags.length > 0) {

        const newTags = internalTags.filter(tag => !selectedTags.includes(tag));
        setTags(newTags);
        setSelectedTags([]);
      } else {
        const newTags = [...internalTags];
        newTags.pop();
        setTags(newTags);
      }
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      setSelectedTags(selectedTags.length === internalTags.length ? [] : internalTags);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setSelectedTags([]);
    }
  };

  const handleDelete = (tagToDelete: string) => {
    const newTags = internalTags.filter((tag) => tag !== tagToDelete);
    setTags(newTags);
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
    <div onClick={() => inputRef.current?.focus()} onTouchEnd={() => inputRef.current?.focus()} className="flex h-full gap-2 items-center cursor-text bg-primary-900 border rounded px-2 py-2 m-h-10">
      <div className="flex flex-wrap gap-2">
        {externalTags?.map((tag, index) => (
          <div key={index} className={`bg-primary-400 antialiased text-xs h-[24px] border border-border rounded items-center gap-2 px-2 flex ${selectedTags.includes(tag) ? 'bg-primary-800 border-link' : ''}`}>
            # {tag}
            <button onClick={(e) => {
              e.preventDefault()
              handleDelete(tag);
            }} onTouchEnd={(e) => {
              e.preventDefault()
              handleDelete(tag);
            }} className="text-sm"><X className="w-3 h-3 text-link" /></button>
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
          className="bg-transparent antialiased flex items-center outline-none text-sm"
        >
          {input}
        </div>
      </div>
    </div>
  );
});

TagInputField.displayName = 'TagInputField';
