import { getSiteSettings } from "../../actions";
import { SiteForm } from "./components/Form";

export const AdminSiteSettings = async () => {
  const site = await getSiteSettings();

  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <h2 className="text-2xl font-bold">Site Settings</h2>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>
        <SiteForm site={site} />
      </div>
    </div>
  );
};

export default AdminSiteSettings;
