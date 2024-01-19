"use client";
import React from 'react'
import { Avatar as AvatarContainer, AvatarImage, AvatarFallback } from '../primitives/avatar-primitive'
export const Avatar = ({ imageUrl, fallback, className }: { className?: string, imageUrl: string | null, fallback: string }) => {
  return (
    <AvatarContainer className={className}>
      <AvatarImage src={imageUrl || ""} />
      <AvatarFallback className="border">{fallback.split(" ").map(name => name[0]).join("")}</AvatarFallback>
    </AvatarContainer>
  )
}
