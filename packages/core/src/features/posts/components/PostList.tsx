"use client"


import { Avatar, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, TagInputField, Button } from '@dir/ui'
import Link from 'next/link';
import React from 'react'
import { MessageSquare, Pin } from 'lucide-react'

export const PostList = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('general');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex gap-8">
        <div className="w-4/12">
          <Select
            value={'general'}
            onValueChange={(e) => {
              setSelectedCategory(e);
            }}
          >
            <SelectTrigger className="bg-primary-900 w-full rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-primary-900 rounded'>

              {[{ key: 'General', value: 'general' }].map((option) => (
                <SelectItem key={option.key} value={option.value} className={`${option.value === selectedCategory ? 'bg-primary-700' : ''} rounded`}>
                  {option.key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-4/12">
          <TagInputField onChange={setSelectedTags} />
        </div>
        <div className="w-4/12">
          <Button>Clear All</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        
        {/* Pinned */}
        <div className={`pt-4 bg-primary-700 relative border-b rounded pb-4 flex items-center gap-4 w-full justify-between pl-8 pr-8`}>
          <Pin className="transform rotate-45 w-4 h-4 absolute top-2 left-2" />
          <div className="flex gap-4">
            <Avatar imageUrl={""} fallback={'dillonraphael'} />
            <div className="flex flex-col">
              <span className="text-link font-semibold">Post title</span>
              <span className="text-xs"><span className="text-link">Henry Riverton</span> • <span className="text-xs">1d ago</span></span>
            </div>
          </div>
          <Badge>
            General
          </Badge>
          <Link href={`/posts`} className="text-link text-sm font-medium flex items-center space-x-2"><MessageSquare className='w-4 h-4' /> <span>{'1'} replies</span></Link>
          <div className="flex flex-col justify-end">
            <span className="text-primary-100 text-xs self-end">Last reply</span>
            <div className="flex gap-4 justify-end">
              <Avatar imageUrl={""} fallback={'dillonraphael'} />
              <div className="flex flex-col">
                <span className="text-link text-sm">Henry Riverton</span>
                <span className="text-sm self-end">1d ago</span>
              </div>
            </div>

          </div>
        </div>
        

        {/* Non Pinned */}
        <div className={`pt-4 bg-transparent relative border-b rounded pb-4 flex items-center gap-4 w-full justify-between pl-8 pr-8`}>
          {/* <Pin className="transform rotate-45 w-4 h-4 absolute top-2 left-2" /> */}
          <div className="flex gap-4">
            <Avatar imageUrl={""} fallback={'dillonraphael'} />
            <div className="flex flex-col">
              <span className="text-link font-semibold">Post title</span>
              <span className="text-xs"><span className="text-link">Henry Riverton</span> • <span className="text-xs">1d ago</span></span>
            </div>
          </div>
          <Badge>
            General
          </Badge>
          <Link href={`/posts`} className="text-link text-sm font-medium flex items-center space-x-2"><MessageSquare className='w-4 h-4' /> <span>{'1'} replies</span></Link>
          <div className="flex flex-col justify-end">
            <span className="text-primary-100 text-xs self-end">Last reply</span>
            <div className="flex gap-4 justify-end">
              <Avatar imageUrl={""} fallback={'dillonraphael'} />
              <div className="flex flex-col">
                <span className="text-link text-sm">Henry Riverton</span>
                <span className="text-sm self-end">1d ago</span>
              </div>
            </div>

          </div>
        </div>


      </div>
    </div>
  )
}
