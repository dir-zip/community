import React from 'react'
import { Badge } from '../components/Badge'
import { Globe } from 'lucide-react'

export type SidebarProps = {
  siteTitle: string,
  memberCount: number
  children: React.ReactNode
}

export const NavWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <nav className="flex flex-col space-y-2">
      {children}
    </nav>
  )
}

export const SiteInfo = ({ siteTitle, memberCount }: { siteTitle: string, memberCount: number }) => {
  return (
    <div className="flex justify-between bg-primary-400 flex-col p-4 rounded space-y-2">
      <h1 className="text-xl font-bold">{siteTitle}</h1>
      <p className="flex items-center space-x-2 text-xs"><Globe className="w-4 h-4" /> <span>{memberCount} member{memberCount > 1 ? 's' : null}</span></p>
    </div>
  )
}

export const TagCloud = () => {
  return (
    <div className="flex flex-col px-4 space-y-2">
      <h2 className="text-sm font-semibold">Tag cloud</h2>
      <div className="flex flex-wrap gap-2">
        <Badge>Next.js</Badge>
        <Badge>React</Badge>
      </div>
    </div>
  )
}

export const UserInfo = ({ username, points }: { username: string, points: number }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-3">
        <h3 className="text-sm font-semibold">{username}</h3>
        <p className="text-xs">{points} points</p>
      </div>
    </div>
  )
}


export const InnerSidebarContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col space-y-4">
      {children}
    </div>
  )
}


export const SidebarContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <aside className="flex justify-between flex-col py-4 px-4 w-64 border-r">
      {children}
    </aside>
  )
}
