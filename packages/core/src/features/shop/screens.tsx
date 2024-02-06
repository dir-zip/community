import { getCurrentUser } from "../auth/actions";
import { ListItems } from "./components/ListItems";

export const ShopPage = async () => {
  const currentUser = await getCurrentUser();
  return (
    <div className="overflow-auto xl:mx-auto xl:w-[960px]">
      <div className="py-6">
        <div className="flex flex-col gap-4 pb-6">
          <h2 className="text-2xl font-bold px-4 md:px-0">Shop</h2>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <ListItems loggedIn={currentUser ? true : false} />
      </div>
    </div>
  );
};
