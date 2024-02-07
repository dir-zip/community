import { AdminSidebar } from "../../../components/ui/AdminSidebar"
import { AdminSiteSettings } from "./site/page"

const AdminMenu = async () => {
  return (
    <>
      <div className="flex md:hidden flex-col">
        <AdminSidebar />
      </div>
      <div className="hidden md:flex flex-col">
        <AdminSiteSettings />
      </div>
    </>
  )
}

export default AdminMenu
