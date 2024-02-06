import { Suspense } from "react";
import { BadgeForm } from "./components/Form";
import Link from "next/link";

import { cn } from "@/utils";
import { buttonVariants } from "@/components/Button";
import { getSingleBadge } from "./actions";
import { BadgesTable } from "./components/BadgesTable";
import { getAllActions } from "../actions/actions";

export const AllBadgesPage = async () => {
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Badges</h2>
            <Link
              className={cn(buttonVariants({ variant: "default" }))}
              href="/admin/badges/new"
            >
              New
            </Link>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <BadgesTable />
        </Suspense>
      </div>
    </div>
  );
};

export const NewBadgePage = async () => {
  const actions = await getAllActions({ skip: 0, take: 10 });
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">New Badges</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <BadgeForm actions={actions.actions} />
        </Suspense>
      </div>
    </div>
  );
};

export const SingleBadgePage = async ({ id }: { id: string }) => {
  const badge = await getSingleBadge({ id: id });
  const actions = await getAllActions({ skip: 0, take: 10 });
  if (!badge) {
    throw new Error("Badge not found");
  }
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">New Badges</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <BadgeForm badge={badge} actions={actions.actions} />
        </Suspense>
      </div>
    </div>
  );
};
