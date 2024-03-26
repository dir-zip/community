import { Inventory, InventoryItem, Item, User } from '@dir/db/drizzle/types'

export type UserWithInventory = User & {
  inventory: InventoryWithItem | null;
};

export type InventoryWithItem = (Inventory & { inventoryItems: (InventoryItem & { item: Item | null, quantity?: number })[] })