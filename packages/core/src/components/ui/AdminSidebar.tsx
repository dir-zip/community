// "use client";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import { cn } from "@/utils";
// import {
//   Monitor,
//   Box,
//   Star,
//   Zap,
//   Shapes,
//   Users,
//   Megaphone,
// } from "lucide-react";

// const _adminSidebarLinks = [
//   { icon: Monitor, text: "Site", link: "/admin" },
//   { icon: Box, text: "Items", link: "/admin/items" },
//   { icon: Star, text: "Badges", link: "/admin/badges" },
//   { icon: Zap, text: "Actions", link: "/admin/actions" },
//   { icon: Shapes, text: "Categories", link: "/admin/categories" },
//   { icon: Users, text: "Users", link: "/admin/users" },
//   { icon: Megaphone, text: "Broadcasts", link: "/admin/broadcasts" },
// ];

// export const AdminSidebar = () => {
//   const pathname = usePathname();
//   return (
//     <div className="bg-primary-500 w-64 h-screen p-4 flex flex-col gap-4">
//       <h3 className="font-bold">Admin</h3>
//       <div className={cn("flex flex-col space-y-2")}>
//         {_adminSidebarLinks.map((link, i) => {
//           const Icon = link["icon"];
//           return (
//             <Link
//               href={link.link}
//               key={i}
//               className={`${
//                 pathname === link.link ? "bg-primary-900" : null
//               } text-sm rounded px-4 py-2 flex items-center space-x-2`}
//             >
//               <Icon className="w-4 h-4" />
//               <span>{link.text}</span>
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/utils";
import {
  Monitor,
  Box,
  Star,
  Zap,
  Shapes,
  Users,
  Megaphone,
} from "lucide-react";

const _adminSidebarLinks = [
  { icon: Monitor, text: "Site", link: "/admin/site" },
  { icon: Box, text: "Items", link: "/admin/items" },
  { icon: Star, text: "Badges", link: "/admin/badges" },
  { icon: Zap, text: "Actions", link: "/admin/actions" },
  { icon: Shapes, text: "Categories", link: "/admin/categories" },
  { icon: Users, text: "Users", link: "/admin/users" },
  { icon: Megaphone, text: "Broadcasts", link: "/admin/broadcasts" },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  return (
    <div className="bg-primary-500 w-full md:w-64 h-screen py-0 md:py-4 px-0 md:px-4 flex flex-col gap-4">
      <h3 className="font-bold hidden md:block">Admin</h3>
      <div className={cn("flex flex-col space-y-0 md:space-y-2")}>
        {_adminSidebarLinks.map((link, i) => {
          const Icon = link["icon"];
          return (
            <Link
              href={link.link}
              key={i}
              className={`${
                pathname === link.link ? "bg-primary-900" : null
              } text-base md:text-sm rounded px-8 md:px-4 py-4 md:py-2 flex items-center space-x-2 border-b md:border-none`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.text}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
