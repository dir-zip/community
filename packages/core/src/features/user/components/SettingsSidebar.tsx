"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const SettingsSidebar = ({
  isInviteOnly,
}: {
  isInviteOnly?: boolean
}) => {
  const pathname = usePathname()

  const linkClassName = (path: string) => {
    return pathname === path ? "bg-primary-500" : ""
  }

  return (
    <div className="flex flex-row md:flex-col gap-2 w-4/12">
      <Link
        href="/settings"
        className={`${linkClassName("/settings")} text-sm p-2 rounded`}
      >
        Account
      </Link>

      <Link
        href="/settings/inventory"
        className={`${linkClassName(
          "/settings/inventory"
        )} text-sm p-2 rounded`}
      >
        Inventory
      </Link>

      {isInviteOnly ? (
        <Link
          href="/settings/invites"
          className={`${linkClassName(
            "/settings/invites"
          )} text-sm p-2 rounded`}
        >
          Invites
        </Link>
      ) : null}
    </div>
  )
}
