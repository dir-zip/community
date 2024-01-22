import {User, Inventory, Item, InventoryItem, Post, Category} from '@dir/db'



export type UserWithInventory = User & {
  inventory: (Inventory & {
    collection: (InventoryItem & {
      item: Item | null;
    })[];
  }) | null;
};
