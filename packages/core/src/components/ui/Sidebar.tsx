"use client"
import { Sidebar as SidebarContainer, type SidebarProps } from "@dir/ui"
import { usePathname } from "next/navigation"
import Link from 'next/link'
import { Layers, Users, Store, FileText } from 'lucide-react'

const _sidebarLinks = [
  { icon: Layers, text: "Feed", link: '/' },
  { icon: FileText, text: "Posts", link: '/posts' },
  { icon: Users, text: "Members", link: '/members' },
  { icon: Store, text: "Shop", link: '/shop' }
]

export const Sidebar = (props: Omit<SidebarProps, 'children'>) => {
  const pathname = usePathname()
  return (
    <SidebarContainer siteTitle={props.siteTitle} memberCount={props.memberCount}>
      {_sidebarLinks.map((link, i) => {
        const Icon = link['icon']
        return (
          <Link href={link.link} key={i} className={`${pathname === link.link ? 'bg-primary-900' : null} text-sm rounded px-4 py-2 flex items-center space-x-2`}><Icon className="w-4 h-4" /><span>{link.text}</span></Link>
        )
      })}
    </SidebarContainer>
  )
}
