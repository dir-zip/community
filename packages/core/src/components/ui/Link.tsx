"use client";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

const Link = ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => {
  const pathname = usePathname();


  const isActive =  pathname === href

  const activeClassName = isActive
    ? "rounded p-2 bg-slate-900 text-white"
    : "hover:bg-slate-300";
  return (
    <NextLink
      href={href}
      as={href}
      className={cn("rounded p-2 text-sm w-full flex items-center gap-2", activeClassName, className)}
    >
      {children}
    </NextLink>
  );
};

export default Link;
