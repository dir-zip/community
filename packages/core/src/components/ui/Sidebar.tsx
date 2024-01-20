"use client"
import { SidebarContainer, UserInfo, SiteInfo, NavWrapper, InnerSidebarContainer, type SidebarProps as _SidebarProps } from "@dir/ui"
import { usePathname } from "next/navigation"
import Link from 'next/link'
import { Layers, Settings, LogOut, Store, FileText } from 'lucide-react'
import { logoutAction } from "../../features/auth/actions"
import { TagCloud } from "./TagCloud"
import { Inventory, InventoryItem, Item, Tag } from "@dir/db"
import { applyEffects } from "~/itemEffects"

const _sidebarLinks = [
  { icon: Layers, text: "Feed", link: '/feed' },
  { icon: FileText, text: "Posts", link: '/posts' },
  { icon: Store, text: "Shop", link: '/shop' }
]

export type SidebarProps = Omit<_SidebarProps, 'children'> & {
  tags?: (Tag & { postCount: number })[],
  open?: boolean,
  user: {
    username: string,
    avatar: string,
    points: number,
    inventory: (Inventory & { collection: (InventoryItem & { item: Item | null, quantity?: number })[] }) | null
  }
}

export const Sidebar = (props: SidebarProps) => {
  const pathname = usePathname()
  const usernameWithEffect = applyEffects("username",{username: props.user.username}, props.user.inventory);
  const avatarWithEffect = applyEffects("avatar",{username: props.user.username, avatar: props.user.avatar}, props.user.inventory);

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

        <UserInfo 
          open={props.open} 
          username={props.user.username}
          customUsernameComponent={usernameWithEffect} 
          avatar={avatarWithEffect} 
          points={props.user.points}
        />

        <NavWrapper open={props.open}>
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
        </NavWrapper>
      </InnerSidebarContainer>
    </SidebarContainer>
  )
}
