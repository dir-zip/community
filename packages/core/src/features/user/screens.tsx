import Link from "next/link";
import { SettingsSidebar } from "./components/SettingsSidebar";
import { AccountForm } from "./components/AccountForm";
import { InventoryList } from "./components/InventoryList";
import { getCurrentUser } from "../auth/actions";

export const UserSettingsScreen = async () => {
  const currentUser = await getCurrentUser();
  return (
    <div className="overflow-auto xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="antialiased text-sm">Manage your account settings</p>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          <SettingsSidebar />
          <div className="bg-primary-800 rounded border p-4 w-full">
            <AccountForm currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserInventoryScreen = async () => {
  const currentUser = await getCurrentUser();
  return (
    <div className="overflow-auto xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="antialiased text-sm">Manage your account settings</p>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          <SettingsSidebar />
          <div className="bg-primary-800 rounded border p-4 w-full">
            <InventoryList currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
};
