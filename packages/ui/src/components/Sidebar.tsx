import React from 'react'
import { Badge } from '../components/Badge'

export const Sidebar = () => {
  return (
    <aside className="flex justify-between flex-col py-4 px-4 w-64 border-r">
      <div>
        <div className="flex items-center justify-between pb-6">
          <h1 className="text-xl font-bold">dir.zip</h1>
        </div>
        <nav className="flex flex-col space-y-2 mb-6">
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
