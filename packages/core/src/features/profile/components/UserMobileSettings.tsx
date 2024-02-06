"use client";
import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import { NavWrapper } from "@dir/ui";
import { logoutAction } from "../../../features/auth/actions";

export const UserMobileSettings = () => {
  return (
    <NavWrapper>
      <Link
        href={`/settings`}
        className={`text-sm rounded px-4 py-2 flex items-center space-x-2`}
      >
        <Settings className="w-4 h-4" />
        <span>Settings</span>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          logoutAction();
        }}
        className="text-sm rounded px-4 py-2 flex items-center space-x-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </NavWrapper>
  );
};
