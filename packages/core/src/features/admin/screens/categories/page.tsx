import { Suspense } from "react";
import CategoryForm from "./components/Form";
import Link from "next/link";
import { CategoryTable } from "./components/CategoryTable";
import { getSingleCategory } from "./actions";
import { cn } from "@/utils";
import { buttonVariants } from "@/components/Button";

export const AllCategoriesPage = async () => {
  return (
    <div className="px-4 xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Categories</h2>
            <Link
              className={cn(buttonVariants({ variant: "default" }))}
              href="/admin/categories/new"
            >
              New
            </Link>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <CategoryTable />
        </Suspense>
      </div>
    </div>
  );
};

export const NewCategoryPage = async () => {
  return (
    <div className="px-4 xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">New Category</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <CategoryForm />
        </Suspense>
      </div>
    </div>
  );
};

export const SingleCategoryPage = async ({ id }: { id: string }) => {
  const category = await getSingleCategory({ id: id });
  if (!category) {
    throw new Error("Category not found");
  }
  return (
    <div className="px-4 xl:mx-auto xl:w-[960px]">
      <div className="py-6 px-2 md:px-0">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">New Category</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <CategoryForm category={category} />
        </Suspense>
      </div>
    </div>
  );
};
