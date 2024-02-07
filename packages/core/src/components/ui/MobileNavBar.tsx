"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Layers, Store, FileText, Settings2, UserCircle } from "lucide-react";
import { UserWithInventory } from "~/lib/types";

export type NavBarProps = {
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
      hide: !props.user || props.user.role !== "ADMIN",
    },
    {
      icon: UserCircle,
      text: props.user ? "Profile" : "Login",
      link: props.user ? `/profile/${props.user.username}` : `/login`,
    },
  ];

  return (
    <div
      className={`fixed z-10 bottom-0 left-0 flex justify-around border-t border-t-border-subtle h-20 w-full bg-primary-500`}
    >
      {_navbarItems.map((item, i) => {
        const Icon = item["icon"];

        if (item.hide) {
          return null;
        }

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
};
