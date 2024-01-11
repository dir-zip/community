import React, { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import { MessageSquare, PenSquare, LucideSquareStack, Hash } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../primitives/dropdown-menu'
import { RichTextField } from './RichTextField'

export type PostPreviewProps = {
  content: string
}

export const PostPreview = (props: PostPreviewProps) => {
  const { content } = props

  const [showGradient, setShowGradient] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the content height is greater than the threshold
    const checkContentHeight = () => {
      const contentHeight = contentRef.current?.clientHeight;
      const heightThreshold = 160; // Adjust this threshold as needed

      if (contentHeight && contentHeight > heightThreshold) {
        setShowGradient(true);
      } else {
        setShowGradient(false);
      }
    };

    checkContentHeight();
    // Add a resize event listener, if the window resize could affect the content size
    window.addEventListener('resize', checkContentHeight);

    // Clean up the event listener
    return () => {
      window.removeEventListener('resize', checkContentHeight);
    };
  }, []);


  const [showEdit, setShowEdit] = useState(false);

  const toggleShowEdit = () => {
    setShowEdit(prev => !prev);
  };

  return (
    <div className="max-h-96 w-full overflow-hidden px-6 py-4 bg-primary-800 rounded border relative">
      <div className="relative overflow-hidden" ref={contentRef}>
        <div className="max-h-60 overflow-y-hidden">
          <RichTextField value={content} editable={false} onValueChange={undefined} />
        </div>
        {showGradient ? <div className="pt-12 h-32 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-800 to-transparent flex items-center justify-center">
          <Button>Read More</Button>
        </div> : null}
      </div>
      <div className="flex justify-between items-center pt-4">

        <a href="#" className="text-link text-sm font-medium flex items-center space-x-2"><MessageSquare className='w-4 h-4' /> <span>12 replies</span></a>

        <div className="bg-primary-700 px-2 py-2 rounded flex items-center space-x-8 transition-all duration-500 ease-in-out">
          <PenSquare className='text-link w-4 cursor-pointer h-4' onClick={toggleShowEdit} />

          {showEdit ? <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger><Hash className="text-link w-4 h-4" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Test</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger><LucideSquareStack className="text-link w-4 h-4" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Test</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> : null}
        </div>
      </div>
    </div>
  )
}
