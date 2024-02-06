"use client";
import {
  NavBarContainer,
  // UserInfo,
  // SiteInfo,
  // NavWrapper,
  // InnerNavBarContainer,
  type NavBarProps as _NavBarProps,
} from "@dir/ui";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Settings,
  LogOut,
  Store,
  FileText,
  Settings2,
  UserCircle,
} from "lucide-react";
import { logoutAction } from "../../features/auth/actions";
import { TagCloud } from "./TagCloud";
import { Inventory, InventoryItem, Item, Tag } from "@dir/db";
import { applyEffects } from "~/itemEffects";
import { UserWithInventory } from "~/lib/types";
import { AdminSidebar } from "./AdminSidebar";

export type NavBarProps = Omit<_NavBarProps, "children" | "user"> & {
  tags?: (Tag & { postCount: number })[];
  user: UserWithInventory | null;
};

export const MobileNavBar = (props: NavBarProps) => {
  const pathname = usePathname();

  const _navbarItems = [
    { icon: Layers, text: "Feed", link: "/feed" },
    { icon: FileText, text: "Posts", link: "/posts" },
    { icon: Store, text: "Shop", link: "/shop" },
    {
      icon: Settings2,
      text: "Admin",
      link: "/admin",
      toShow: props.user && props.user.role === "ADMIN",
    },
    {
      icon: UserCircle,
      text: "Profile",
      link: props.user ? `/profile/${props.user.username}` : `/login`,
    },
  ];

  return (
    <div
      className={`fixed z-10 bottom-0 left-0 flex justify-around border-t border-t-border-subtle h-20 w-full bg-primary-500`}
    >
      {_navbarItems.map((item, i) => {
        const Icon = item["icon"];

        return (
          <Link
            href={item.link}
            key={i}
            className={`${
              pathname === item.link || pathname.startsWith(`${item.link}/`)
                ? "bg-primary-900"
                : null
            } text-xs rounded flex flex-col justify-center w-full items-center px-2 gap-y-1 w-12`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.text}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <NavBarContainer open={props.open}>here navigation yo</NavBarContainer>
  );

  // return (
  //   <NavBarContainer open={props.open}>
  //     <InnerNavBarContainer>
  //       <SiteInfo
  //         siteTitle={props.siteTitle}
  //         memberCount={props.memberCount}
  //         open={props.open}
  //       />
  //       <NavWrapper open={props.open}>
  //         {_sidebarLinks.map((link, i) => {
  //           const Icon = link["icon"];
  //           return (
  //             <Link
  //               href={link.link}
  //               key={i}
  //               className={`${
  //                 pathname === link.link || pathname.startsWith(`${link.link}/`)
  //                   ? "bg-primary-900"
  //                   : null
  //               } text-sm rounded px-4 py-2 flex items-center space-x-2`}
  //             >
  //               <Icon className="w-4 h-4" />
  //               {props.open && <span>{link.text}</span>}
  //             </Link>
  //           );
  //         })}
  //       </NavWrapper>
  //     </InnerNavBarContainer>

  //     <InnerNavBarContainer>
  //       {props.open ? (
  //         <div className="py-6">
  //           <TagCloud tags={props.tags || []} />
  //         </div>
  //       ) : null}

  //       {props.user ? (
  //         <UserInfo
  //           open={props.open}
  //           username={props.user.username}
  //           customUsernameComponent={applyEffects(
  //             "username",
  //             { username: props.user.username },
  //             props.user.inventory,
  //           )}
  //           avatar={applyEffects(
  //             "avatar",
  //             {
  //               username: props.user.username,
  //               avatar: props.user.avatar || "",
  //             },
  //             props.user.inventory,
  //           )}
  //           points={props.user.points}
  //         />
  //       ) : (
  //         <div className="flex bg-primary-700 rounded p-4 flex-col gap-2">
  //           <p className="text-xs">You're not logged in</p>
  //           <div className="flex flex-row gap-1 text-sm">
  //             <Link href={"/login"}>
  //               <span className="text-link">Login</span>
  //             </Link>
  //             <span>Or</span>
  //             <Link href={"/signup"}>
  //               <span className="text-link">Create an account</span>
  //             </Link>
  //           </div>
  //         </div>
  //       )}

  //       {props.user ? (
  //         <NavWrapper open={props.open}>
  //           <Link
  //             href={`/settings`}
  //             className={`${
  //               pathname === "/settings" || pathname.startsWith("/settings/")
  //                 ? "bg-primary-900"
  //                 : null
  //             } text-sm rounded px-4 py-2 flex items-center space-x-2`}
  //           >
  //             <Settings className="w-4 h-4" />
  //             {props.open && <span>Settings</span>}
  //           </Link>
  //           <button
  //             onClick={(e) => {
  //               e.preventDefault();
  //               logoutAction();
  //             }}
  //             className="text-sm rounded px-4 py-2 flex items-center space-x-2"
  //           >
  //             <LogOut className="w-4 h-4" />
  //             {props.open && <span>Logout</span>}
  //           </button>
  //         </NavWrapper>
  //       ) : null}
  //     </InnerNavBarContainer>
  //   </NavBarContainer>
  // );
};
