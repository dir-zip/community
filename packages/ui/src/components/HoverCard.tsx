"use client"
import React from 'react'
import { HoverCard as HoverCardRoot, HoverCardTrigger, HoverCardArrow, HoverCardContent } from "../primitives/hover-card-primitive"

export const HoverCard = ({trigger, content}: {trigger: React.ReactNode ,content: React.ReactNode }) => {
  return (
    <HoverCardRoot openDelay={300}>
    <HoverCardTrigger>
      {trigger}
    </HoverCardTrigger>
    <HoverCardContent className="relative translate-y-3 w-fit bg-primary-800 border rounded border-border-subtle p-1.5 ">
      <HoverCardArrow 
        className="absolute text-primary-800 fill-current stroke-border-subtle -z-10"
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          width: '22px',
          height: '16px',
          bottom: '-9px',
          left: '-11px'
        }}
      />
      {content}
    </HoverCardContent>
  </HoverCardRoot>
  )
}


