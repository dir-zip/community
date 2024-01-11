"use client";
import React from 'react'
import { Avatar as AvatarContainer, AvatarImage, AvatarFallback } from '../primitives/avatar-primitive'
export const Avatar = ({ imageUrl, fallback }: { imageUrl: string | null, fallback: string }) => {
  return (
    <AvatarContainer>
      <AvatarImage src={imageUrl || ""} />
      <AvatarFallback className="border">{fallback.split(" ").map(name => name[0]).join("")}</AvatarFallback>
    </AvatarContainer>
  )
}
