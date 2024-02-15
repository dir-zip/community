import { schema, InferSelectModel } from '@dir/db'


export type UserWithInventory = InferSelectModel<typeof schema.user> & {
  inventory: (InferSelectModel<typeof schema.inventory> & {
    collection: (InferSelectModel<typeof schema.inventoryItem> & {
      item: InferSelectModel<typeof schema.item> | null;
    })[];
  }) | null;
};
