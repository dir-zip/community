"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "./Button";
import Link from "./Link";
import { Resources } from "../../index";
import type { User } from "packages/db";
import { logoutAction } from "@/features/auth/actions";

const MainNav = ({root}: {root?: string}) => {
  return (
    <div className="flex flex-col">
      <ul className="flex flex-col py-2 space-y-4">
        <li>
          <Link href={root || "/"}>Posts</Link>
        </li>
      </ul>
    </div>
  );
};

const AdminNav = ({resources}: {resources?: Resources}) => {
  return (
    <div className="flex flex-col bg-slate-100 p-2 border border-slate-200 rounded">
      <ul className="flex flex-col p-2 space-y-4">
        <li>
          <Link href={"/admin"}>Settings</Link>
        </li>
        <li>
          <Link href={"/admin/items"}>Items</Link>
        </li>
        <li>
          <Link href={"/admin/actions"}>Actions</Link>
        </li>
        <li>
          <Link href={"/admin/badges"}>Badges</Link>
        </li>
        <li>
          <Link href={"/admin/categories"}>Categories</Link>
        </li>
        <li>
          <Link href={"/admin/users"}>Users</Link>
        </li>


        {resources?.map((resource, i) => {
          return (
            <li key={i}>
              <Link href={`/admin/${resource.name.toLowerCase()}`}>{resource.name.charAt(0).toUpperCase() + resource.name.slice(1).toLowerCase()}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  );
};

const Sidebar = ({
  adminSidebarComponent,
  root,
  sidebarLinks,
  resources,
  currentUser
}: {
  adminSidebarComponent?: boolean;
  root: string;
  sidebarLinks?: {icon?: React.ElementType, url: string, text:string}[];
  resources?: Resources
  currentUser?: User
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(event.target as Node)
      ) {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [mobileNavRef]);


  return (
    <>
      <div className="hidden w-[200px] md:flex md:flex-col p-2 border-r-slate-200 border-r">
        <div className="space-y-4">

          {adminSidebarComponent && <AdminNav resources={resources}/>}
          {sidebarLinks && sidebarLinks.length ? <div className="flex flex-col">
            <ul className="flex flex-col py-2 space-y-4">
              {sidebarLinks.map((link, index) => {
                const Icon = link.icon
                return (
                  <li key={index}>
                    <Link className="font-medium" href={link.url === "/" ? root ? root : "/" : link.url}>{Icon && <Icon />}  {link.text}</Link>
                  </li>
                )
              })}
            </ul>
          </div> : <MainNav root={root} />}
          
          <div>
            {currentUser ? 
              <div>
                <p>{currentUser.username}</p>
                <p>Points: {currentUser.points}</p>
                <button onClick={(e) => {
                  e.preventDefault()
                  logoutAction()
                }} className={cn(buttonVariants({variant: 'ghost'}))}>Logout</button>
                {currentUser.role === "ADMIN" ? <Link className={cn(buttonVariants({variant: 'ghost'}))} href='/admin'>Admin</Link> : null}
              </div> : <div>You're not logged in</div>}
          </div>

        </div>
      </div>

      {/* Mobile */}
      <div
        ref={mobileNavRef}
        className={cn(
          "border border-t-slate-200 flex fixed bottom-0 left-0 w-full bg-slate-50 z-10 md:hidden transition-all",
          mobileSidebarOpen
            ? "h-[500px]"
            : "h-[55px] justify-center items-center",
        )}
      >
        <Button
          className={cn(mobileSidebarOpen ? "hidden" : "block")}
          variant={"ghost"}
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div
          className={cn("p-4 w-full", mobileSidebarOpen ? "flex" : "hidden")}
        >
          <div className="py-1 flex flex-col space-y-6 w-full">
            <Button
              variant={"ghost"}
              className={cn("w-fit", mobileSidebarOpen ? "block" : "hidden")}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="max-h-[500px] overflow-y-auto space-y-4">
              {adminSidebarComponent && <AdminNav resources={resources} />}
              {sidebarLinks && sidebarLinks.length ? <div className="flex flex-col">
            <ul className="flex flex-col py-2 space-y-4">
              {sidebarLinks.map((link, index) => {
                const Icon = link.icon
                return (
                  <li key={index}>
                    <Link className="font-medium" href={link.url}>{Icon && <Icon />} {link.text}</Link>
                  </li>
                )
              })}
            </ul>
          </div> : <MainNav />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
