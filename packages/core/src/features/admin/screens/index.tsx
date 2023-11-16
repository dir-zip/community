import { getSiteSettings } from "../actions";
import { SiteForm } from "./Form";


const AdminDashboardPage = async () => {
  const site = await getSiteSettings()

  return (
    <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
      <div className="w-full">
        <SiteForm site={site} />
        </div>
    </div>
  );
};

export default AdminDashboardPage;