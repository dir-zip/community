"use client"
import React, { useEffect, useRef, useState } from 'react'
import { buttonVariants } from '@dir/ui'
import { RichTextField } from '~/components/Editor/RichTextField'
import { MessageSquare, PenSquare, Hash, ChevronsRight, ChevronsLeft } from 'lucide-react'
import Link from 'next/link'

export type CommentPreviewProps = {
  content: string,
  replies: number,
  mainPostSlug: string,
  slug: string,
  userId: string,
  currentUserId: string | null
}

export const CommentPreview = (props: CommentPreviewProps) => {
  const { content, replies, mainPostSlug, slug, currentUserId, userId } = props


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

    // Create a new MutationObserver instance
    const observer = new MutationObserver(checkContentHeight);

    // Start observing the contentRef for changes
    if (contentRef.current) {
      observer.observe(contentRef.current, { childList: true, subtree: true });
    }

    // Clean up the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, [content]);


  const [showEdit, setShowEdit] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) 

  const toggleShowEdit = () => {
    setShowEdit(prev => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (divRef.current && !divRef.current.contains(event.target as Node) && !isDropdownOpen) {
        setShowEdit(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [divRef, isDropdownOpen]);

  return (
    <div className="max-h-96 w-full overflow-hidden px-6 py-4 bg-primary-800 rounded border border-border-subtle relative">
      <div className="relative overflow-hidden" ref={contentRef}>
        <div className="max-h-60 overflow-y-hidden">
          <RichTextField value={content} editable={false} onValueChange={undefined} />
        </div>
        {showGradient ? <div className="pt-12 h-32 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-800 to-transparent flex items-center justify-center">
          <Link href={`/posts/${mainPostSlug}/comments/${slug}`} className={buttonVariants({variant: "default"})}>Read More</Link>
        </div> : null}
      </div>
      <div className="flex justify-between items-center pt-4">

        <Link href={`/posts/${mainPostSlug}/comments/${slug}`} className="text-link text-sm font-medium flex items-center space-x-2"><MessageSquare className='w-4 h-4' /> <span>{replies} replies</span></Link>

        {currentUserId === userId ? <div ref={divRef} className="bg-primary-700 px-2 py-2 rounded flex items-center space-x-8 transition-all duration-500 ease-in-out">
          <div className="flex items-center gap-2">
            <Link href={`/posts/${mainPostSlug}/comments/${slug}/edit`}><PenSquare className='text-link w-4 cursor-pointer h-4' /></Link>
            {/* {showEdit ? <ChevronsLeft className="w-4 h-4 cursor-pointer"  onClick={toggleShowEdit}/> : <ChevronsRight className="w-4 h-4 cursor-pointer"  onClick={toggleShowEdit}/>} */}
          </div>
          {/* {showEdit ? <div className="flex items-center space-x-4">
          </div> : null} */}
        </div> : null}
      </div>
    </div>
  )
}
