import React from 'react'
import { Badge } from '../components/Badge'
import { Globe } from 'lucide-react'

export type SidebarProps = {
  siteTitle: string,
  memberCount: number
  children: React.ReactNode
}

export const Sidebar = ({ siteTitle, memberCount, children }: SidebarProps) => {
  return (
    <aside className="flex justify-between flex-col py-4 px-4 w-64 border-r">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between bg-primary-400 flex-col p-4 rounded space-y-2">
          <h1 className="text-xl font-bold">{siteTitle}</h1>
          <p className="flex items-center space-x-2 text-xs"><Globe className="w-4 h-4" /> <span>{memberCount} member{memberCount > 1 ? 's' : null}</span></p>
        </div>
        <nav className="flex flex-col space-y-2">
          {children}
        </nav>
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold">Tag cloud</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Next.js</Badge>
            <Badge>React</Badge>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold">Henry Riventon</h3>
              <p className="text-xs">100 points</p>
            </div>
          </div>
        </div>

        <div>
          <p>Link</p>
        </div>

      </div>


    </aside>
  )
}
