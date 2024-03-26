"use client"
import React from 'react'
import {Badge} from '@dir/ui'
import Link from 'next/link'
import { Tag } from 'packages/db/drizzle/types'

export const TagCloud = ({tags}: {tags: (Tag & {postCount: number})[]}) => {
  const displayTags = tags.slice(0, 10);
  const hasMoreTags = tags.length > 10;

  const getClassName = (postCount: number, min: number, max: number) => {
    const range = max - min;
    const step = range / 6;
  
    if (postCount >= min && postCount < min + step) return 'text-xs';
    if (postCount >= min + step && postCount < min + 2 * step) return 'text-sm';
    if (postCount >= min + 2 * step && postCount < min + 3 * step) return 'text-md';
    if (postCount >= min + 3 * step && postCount < min + 4 * step) return 'text-lg';
    if (postCount >= min + 4 * step && postCount < min + 5 * step) return 'text-xl';
    if (postCount >= min + 5 * step) return 'text-2xl';
  }

// Calculate min and max postCount values
const minPostCount = Math.min(...tags.map(tag => tag.postCount));
const maxPostCount = Math.max(...tags.map(tag => tag.postCount));

  return (
    <div className="flex flex-col px-4 space-y-2">
      <h2 className="text-sm font-semibold">Tag cloud</h2>
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => {
          return <Link key={tag.id} href={`/posts/?tags=${tag.slug}`}><Badge className={`${getClassName(tag.postCount, minPostCount, maxPostCount)}`}># {tag.title}</Badge></Link>
        })}
        {hasMoreTags && <div>...</div>}
      </div>
    </div>
  )
}