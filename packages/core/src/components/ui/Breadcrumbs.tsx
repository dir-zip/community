"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "lucide-react";
import { Skeleton } from "@dir/ui";

type BreadcrumbsProps = {
  ignore?: { breadcrumb: string | undefined; href: string }[];
};

export const Breadcrumbs = ({ ignore }: BreadcrumbsProps) => {
  const pathname = usePathname();


  const [breadcrumbs, setBreadcrumbs] = React.useState<
    { breadcrumb: string; href: string }[] | undefined
  >([]);

  const buildBreadcrumbs = () => {
    const linkPath = pathname.split("/");
    linkPath.shift();

    const pathArray = linkPath.map((path, i) => {
      return {
        breadcrumb: path.split("?")[0] as string,
        href: "/" + linkPath.slice(0, i + 1).join("/"),
      };
    });

    if (ignore && ignore.length) {
      const filtered = pathArray.filter((el) => {
        return !ignore.some((rm) => {
          const ignorePathParts = rm.href.split("/");
          const elPathParts = el.href.split("/");
          return (
            ignorePathParts.length === elPathParts.length &&
            ignorePathParts.every((part, i) => part === elPathParts[i] || part.startsWith(":"))
          );
        });
      });

      setBreadcrumbs(filtered);
    } else {
      setBreadcrumbs(pathArray);
    }
  };

  React.useEffect(() => {
    buildBreadcrumbs();
    return () => {
      buildBreadcrumbs();
    };
  }, [pathname]);

  return (
    <ul className="flex items-center space-x-4 w-full overflow-x-auto py-6 top-0 fixed z-20 md:relative md:py-0 pr-12 md:pr-0">
      <li>
        <Link href={"/"}>
          <HomeIcon
            className={pathname === "/" ? "h-5 w-5 text-foreground" : "h-5 w-5 text-link hover:text-foregroud"}
            aria-hidden="true"
          />
        </Link>
      </li>
      {pathname === "/" ? null : (
        breadcrumbs?.length ? (
          breadcrumbs.map((breadcrumb, i) => {
            return (
              <li key={i}>
                {pathname === breadcrumb.href ? (
                  <div className="flex items-center">
                    <svg
                      className="text-gray-400 mr-2 w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M10.5858 6.34317L12 4.92896L19.0711 12L12 19.0711L10.5858 17.6569L16.2427 12L10.5858 6.34317Z"
                        fill="currentColor"
                      />
                    </svg>

                    <span className="text-sm font-medium text-gray-800">
                      {breadcrumb.breadcrumb.charAt(0).toUpperCase() +
                        breadcrumb.breadcrumb.slice(1)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="text-gray-400 mr-2 w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M10.5858 6.34317L12 4.92896L19.0711 12L12 19.0711L10.5858 17.6569L16.2427 12L10.5858 6.34317Z"
                        fill="currentColor"
                      />
                    </svg>
                    <Link
                      href={breadcrumb.href}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {breadcrumb.breadcrumb.charAt(0).toUpperCase() +
                        breadcrumb.breadcrumb.slice(1)}
                    </Link>
                  </div>
                )}
              </li>
            );
          })
        ) : (
          <Skeleton className="w-3/12 h-4" />
        )
      )}
    </ul>
  );
};

export default Breadcrumbs;
