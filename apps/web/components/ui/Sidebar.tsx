'use client'
import Link from 'next/link';
import { type SidebarLinks } from "@1upsaas/core"
import {logoutAction} from 'apps/web/app/auth/actions'



export const Sidebar = ({links}: {links?: SidebarLinks}) => {

  return (
    <div className="p-2 space-y-2">
      <h1>1upsaas</h1>
      <ul className="flex flex-col">
      {links?.map((link, i) => {
        return (
          <Link href={link.url} key={i} className="px-2">{link.text}</Link>
        )
      })}
      </ul>


      
      <ul>


      <li className="px-2"><button onClick={async (e) => {
        e.preventDefault()
        await logoutAction()
      }}>Logout</button></li>
      </ul>
    </div>
  )
}