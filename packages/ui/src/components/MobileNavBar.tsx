import React from "react";
import { Badge } from "../components/Badge";
import { Globe } from "lucide-react";
import { Avatar } from "./Avatar";
import { GoldCoinIcon } from "@/icons/GoldCoin";
import { cn } from "@/utils";

export type NavBarProps = {
  siteTitle: string;
  memberCount: number;
  user: {
    username: string;
    points: number;
    avatar: string;
  };
  children: React.ReactNode;
};

// export const InnerNavBarContainer = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   return <div className="flex flex-col space-y-4">{children}</div>;
// };

export const NavBarContainer = ({
  children,
  open,
}: {
  children: React.ReactNode;
  open?: boolean;
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 flex justify-between py-2 border-t border-t-border-subtle h-20 w-full bg-primary-500",
        // open ? "w-64 px-4 py-4" : "w-20 px-2 py-2",
      )}
    >
      {children}
    </div>
  );
};
