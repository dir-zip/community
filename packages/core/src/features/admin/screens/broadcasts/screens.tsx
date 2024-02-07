import { Suspense } from "react";
import { BroadcastsTable } from "./components/BroadcastsTable";

export const BroadcastsIndex = async () => {
  return (
    <div className="px-4 xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Broadcasts</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <BroadcastsTable />
        </Suspense>
      </div>
    </div>
  );
};
