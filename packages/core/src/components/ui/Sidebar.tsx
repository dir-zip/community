"use client"
import { SidebarContainer, UserInfo, SiteInfo, NavWrapper, InnerSidebarContainer, type SidebarProps as _SidebarProps } from "@dir/ui"
import { usePathname } from "next/navigation"
import Link from 'next/link'
import { Layers, Settings, LogOut, Store, FileText } from 'lucide-react'
import { logoutAction } from "../../features/auth/actions"
import { TagCloud } from "./TagCloud"
import { Tag } from "@dir/db/drizzle/types"
import { applyEffects } from "~/itemEffects"
import { UserWithInventory } from "~/lib/types"

const _sidebarLinks = [
  { icon: Layers, text: "Feed", link: '/feed' },
  { icon: FileText, text: "Posts", link: '/posts' },
  { icon: Store, text: "Shop", link: '/shop' }
]

export type SidebarProps = Omit<_SidebarProps, 'children' | 'user'> & {
  tags?: (Tag & { postCount: number })[],
  open?: boolean,
  user: UserWithInventory | null
}

export const Sidebar = (props: SidebarProps) => {
  const pathname = usePathname()

  return (
    <SidebarContainer open={props.open}>
      <InnerSidebarContainer>
        <SiteInfo siteTitle={props.siteTitle} memberCount={props.memberCount} open={props.open} />
        <NavWrapper open={props.open}>
          {_sidebarLinks.map((link, i) => {
            const Icon = link['icon'];
            return (
              <Link href={link.link} key={i} className={`${pathname === link.link || pathname.startsWith(`${link.link}/`) ? 'bg-primary-900' : null} text-sm rounded px-4 py-2 flex items-center space-x-2`}>
                <Icon className="w-4 h-4" />
                {props.open && <span>{link.text}</span>}
              </Link>
            );
          })}
        </NavWrapper>
      </InnerSidebarContainer>

      <InnerSidebarContainer>
        {props.open ? <div className="py-6">
          <TagCloud tags={props.tags || []} />
        </div> : null}

        { props.user ?  <UserInfo 
          open={props.open} 
          username={props.user.username}
          customUsernameComponent={applyEffects("username",{username: props.user.username}, props.user.inventory)} 
          avatar={applyEffects("avatar",{username: props.user.username, avatar: props.user.avatar || ""}, props.user.inventory)} 
          points={props.user.points}
        /> : <div className="flex bg-primary-700 rounded p-4 flex-col gap-2">
          <p className="text-xs">You're not logged in</p>
          <div className="flex flex-row gap-1 text-sm">
            <Link href={'/login'}><span className="text-link">Login</span></Link>
            <span>Or</span>
            <Link href={'/signup'}><span className="text-link">Create an account</span></Link>
          </div>
        </div> }

        {props.user ? <NavWrapper open={props.open}>
          <Link href={`/settings`} className={`${pathname === '/settings' || pathname.startsWith('/settings/') ? 'bg-primary-900' : null} text-sm rounded px-4 py-2 flex items-center space-x-2`}>
            <Settings className="w-4 h-4" />
            {props.open && <span>Settings</span>}
          </Link>
          <button onClick={(e) => {
            e.preventDefault();
            logoutAction();
          }} className="text-sm rounded px-4 py-2 flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            {props.open && <span>Logout</span>}
          </button>
        </NavWrapper> : null }
      </InnerSidebarContainer>
    </SidebarContainer>
  )
}
