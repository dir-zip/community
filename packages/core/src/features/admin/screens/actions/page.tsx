import { Suspense } from "react";
import { ActionForm } from "./components/Form";
import Link from "next/link";

import { cn } from "@/utils";
import { buttonVariants } from "@/components/Button";
import { getSingleAction } from "./actions";
import { ActionsTable } from "./components/ActionsTable";

export const AllActionsPage = async () => {
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Actions</h2>
            <Link
              className={cn(buttonVariants({ variant: "default" }))}
              href="/admin/actions/new"
            >
              New
            </Link>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <ActionsTable />
        </Suspense>
      </div>
    </div>
  );
};

export const NewActionPage = async () => {
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">New Action</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <ActionForm />
        </Suspense>
      </div>
    </div>
  );
};

export const SingleActionPage = async ({ id }: { id: string }) => {
  const action = await getSingleAction({ id: id });
  if (!action) {
    throw new Error("Action not found");
  }
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">New Action</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <ActionForm action={action} />
        </Suspense>
      </div>
    </div>
  );
};
