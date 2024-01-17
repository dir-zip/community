"use client"
import { SidebarContainer, UserInfo, SiteInfo, NavWrapper, InnerSidebarContainer, type SidebarProps } from "@dir/ui"
import { usePathname } from "next/navigation"
import Link from 'next/link'
import { Layers, Settings, LogOut, Store, FileText } from 'lucide-react'
import { logoutAction } from "../../features/auth/actions"
import { TagCloud } from "./TagCloud"
import { Tag } from "@dir/db"

const _sidebarLinks = [
  { icon: Layers, text: "Feed", link: '/feed' },
  { icon: FileText, text: "Posts", link: '/posts' },
  { icon: Store, text: "Shop", link: '/shop' }
]

export const Sidebar = (props: Omit<SidebarProps, 'children'> & { tags?: (Tag & { postCount: number })[] }) => {
  const pathname = usePathname()
  return (
    <SidebarContainer>
      <InnerSidebarContainer>
        <SiteInfo siteTitle={props.siteTitle} memberCount={props.memberCount} />
        <NavWrapper>
          {_sidebarLinks.map((link, i) => {
            const Icon = link['icon']
            return (
              <Link href={link.link} key={i} className={`${ pathname === link.link || pathname.startsWith(`${link.link}/`) ? 'bg-primary-900' : null} text-sm rounded px-4 py-2 flex items-center space-x-2`}><Icon className="w-4 h-4" /><span>{link.text}</span></Link>
            )
          })}
        </NavWrapper>
      </InnerSidebarContainer>

      <InnerSidebarContainer>
        <div className="py-6">
          <TagCloud tags={props.tags || []} />
        </div>
        <UserInfo username={props.user.username} avatar={props.user.avatar} points={props.user.points} />
        <NavWrapper>
          <Link href={`/settings`} className={`${pathname === '/settings' || pathname.startsWith('/settings/') ? 'bg-primary-900' : null} text-sm rounded px-4 py-2 flex items-center space-x-2`}><Settings className="w-4 h-4" /><span>Settings</span></Link>
          <button onClick={(e) => {
            e.preventDefault()
            logoutAction()
          }} className="text-sm rounded px-4 py-2 flex items-center space-x-2"><LogOut className="w-4 h-4" /><span>Logout</span></button>
        </NavWrapper>
      </InnerSidebarContainer>
    </SidebarContainer>
  )
}
