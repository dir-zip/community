import React from "react";
import { Badge } from "../components/Badge";
import { Globe } from "lucide-react";
import { Avatar } from "./Avatar";
import { GoldCoinIcon } from "@/icons/GoldCoin";
import { cn } from "@/utils";

export type SidebarProps = {
  siteTitle: string;
  memberCount: number;
  user: {
    username: string;
    points: number;
    avatar: string;
  };
  children: React.ReactNode;
};

export const NavWrapper = ({
  children,
  open,
}: {
  open?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <nav className={cn("flex flex-col space-y-2", open ? "" : "items-center")}>
      {children}
    </nav>
  );
};

export const SiteInfo = ({
  siteTitle,
  memberCount,
  open,
}: {
  open?: boolean;
  siteTitle: string;
  memberCount: number;
}) => {
  return (
    <div
      className={cn(
        `flex justify-between bg-primary-400 flex-col p-4 rounded space-y-2`,
        open ? "" : "items-center",
      )}
    >
      {open ? (
        <h1 className="text-xl font-bold">{siteTitle}</h1>
      ) : (
        <div className="rounded-full border border-primary-100 w-6 h-6 flex items-center justify-center p-2">
          <span className="font-bold">{siteTitle.charAt(0)}</span>
        </div>
      )}
      {open ? (
        <p className="flex items-center space-x-2 text-xs">
          <Globe className="w-4 h-4" />{" "}
          <span>
            {memberCount} member{memberCount > 1 ? "s" : null}
          </span>
        </p>
      ) : null}
    </div>
  );
};

export const UserInfo = ({
  customUsernameComponent,
  username,
  avatar,
  points,
  open,
}: {
  customUsernameComponent?: React.ReactNode | null;
  open?: boolean;
  username: string;
  avatar: React.ReactNode;
  points: number;
}) => {
  return (
    <div
      className={cn(
        "flex bg-primary-700 rounded",
        open ? "p-4" : "p-2 items-center justify-center",
      )}
    >
      {avatar}
      {open ? (
        <div className="flex px-4 flex-col space-y-2">
          <a href={`/profile/${username}`}>
            {customUsernameComponent || username}
          </a>
          <p className="text-xs flex space-x-1 items-center">
            <GoldCoinIcon />
            <span>{points} points</span>
          </p>
        </div>
      ) : null}
    </div>
  );
};

export const InnerSidebarContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="flex flex-col space-y-4">{children}</div>;
};

export const SidebarContainer = ({
  children,
  open,
}: {
  children: React.ReactNode;
  open?: boolean;
}) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 flex justify-between flex-col py-4 border-r border-r-border-subtle",
        open ? "w-64 px-4 py-4" : "w-20 px-2 py-2",
      )}
    >
      {children}
    </aside>
  );
};
