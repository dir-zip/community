import UsersTable from "./components/UsersTable";
import { Suspense } from "react";

const UsersAdminPage = async () => {
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Users</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <UsersTable />
        </Suspense>
      </div>
    </div>
  );
};

export default UsersAdminPage;
