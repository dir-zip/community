import { schema, InferSelectModel } from '..'

export type Tag = InferSelectModel<typeof schema.tag>;
export type PostTag = InferSelectModel<typeof schema.postTags>;
export type User = InferSelectModel<typeof schema.user>;
export type Post = InferSelectModel<typeof schema.post>;
export type Category = InferSelectModel<typeof schema.category>;
export type Comment = InferSelectModel<typeof schema.comment>;
export type Broadcast = InferSelectModel<typeof schema.broadcast>;
export type Badge = InferSelectModel<typeof schema.badge>;
export type Inventory = InferSelectModel<typeof schema.inventory>;
export type InventoryItem = InferSelectModel<typeof schema.inventoryItem>;
export type Item = InferSelectModel<typeof schema.item>;
export type List = InferSelectModel<typeof schema.list>;
export type UserList = InferSelectModel<typeof schema.userList>;
export type ListBroadcast = InferSelectModel<typeof schema.listBroadcast>;
export type Action = InferSelectModel<typeof schema.action>;
export type Condition = InferSelectModel<typeof schema.condition>;
export type Session = InferSelectModel<typeof schema.session>;
export type GlobalSetting = InferSelectModel<typeof schema.globalSetting>;
export type FeatureToggle = InferSelectModel<typeof schema.featureToggle>;
