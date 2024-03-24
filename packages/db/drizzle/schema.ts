import { pgTable, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { createId } from '@paralleldrive/cuid2';

export const user = pgTable("User", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  hashedPassword: text("hashedPassword"),
  role: text("role").default("USER").notNull(),
  avatar: text("avatar"),
  verified: boolean("verified").notNull().default(false),
  points: integer("points").default(0).notNull(),
  bannerImage: text("bannerImage"),
  inventoryId: text('inventoryId')
});


export const session = pgTable("Session", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  expiresAt: numeric("expiresAt"),
  hashedSessionToken: text("hashedSessionToken"),
  csrfToken: text("csrfToken"),
  data: text("data"),
  userId: text("userId").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
});

export const post = pgTable("Post", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  body: text("body").notNull(),
  categoryId: text("categoryId").notNull().references(() => category.id, { onDelete: "restrict", onUpdate: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
});


export const comment = pgTable("Comment", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  body: text("body").notNull(),
  postId: text("postId").notNull().references(() => post.id, { onDelete: "restrict", onUpdate: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  parentId: text("parentId"),
});



export const item = pgTable("Item", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  price: integer("price").notNull(),
  effect: text("effect").unique(),
});


export const badge = pgTable("Badge", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
});

export const action = pgTable("Action", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull().unique(),
  value: integer("value").notNull(),
});


export const tag = pgTable("Tag", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
});

export const postTags = pgTable("PostTags", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  postId: text("postId").notNull().references(() => post.id, { onDelete: "restrict", onUpdate: "cascade" }),
  tagId: text("tagId").notNull().references(() => tag.id, { onDelete: "restrict", onUpdate: "cascade" }),
});

export const category = pgTable("Category", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
});


export const event = pgTable("Event", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  actionId: text("actionId").notNull().references(() => action.id, { onDelete: "restrict", onUpdate: "cascade" }),
});

export const inventory = pgTable("Inventory", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }).unique(),
});


export const inventoryItem = pgTable("InventoryItem", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  inventoryId: text("inventoryId").notNull().references(() => inventory.id, { onDelete: "restrict", onUpdate: "cascade" }),
  type: text("type").notNull(),
  equipped: boolean('equipped').notNull(),
  itemId: text("itemId").references(() => item.id, { onDelete: "set null", onUpdate: "cascade" }),
  badgeId: text("badgeId").references(() => badge.id, { onDelete: "set null", onUpdate: "cascade" }),
});

export const condition = pgTable("Condition", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  actionId: text("actionId").notNull().references(() => action.id, { onDelete: "restrict", onUpdate: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  badgeId: text("badgeId").notNull().references(() => badge.id, { onDelete: "restrict", onUpdate: "cascade" }),
});

export const featureToggle = pgTable("FeatureToggle", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  feature: text("feature").notNull().unique(),
  isActive: boolean('isActive').notNull(),
  globalSettingId: integer("globalSettingId").default(1).notNull().references(() => globalSetting.id, { onDelete: "restrict", onUpdate: "cascade" }),
  value: text("value"),
});




export const broadcast = pgTable("Broadcast", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  postId: text("postId").notNull().references(() => post.id, { onDelete: "restrict", onUpdate: "cascade" }),
  status: text("status").notNull(),
});


export const list = pgTable("List", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const listBroadcast = pgTable("ListBroadcast", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  listId: text("listId").notNull().references(() => list.id, { onDelete: "restrict", onUpdate: "cascade" }),
  broadcastId: text("broadcastId").notNull().references(() => broadcast.id, { onDelete: "restrict", onUpdate: "cascade" }),
});

export const userList = pgTable("UserList", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  listId: text("listId").notNull().references(() => list.id, { onDelete: "restrict", onUpdate: "cascade" }),
});

export const token = pgTable("Token", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: timestamp("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: timestamp("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  hashedToken: text("hashedToken").notNull().unique(),
  type: text("type").notNull(),
  expiresAt: numeric("expiresAt").notNull(),
  sentTo: text("sentTo"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  lastFour: text("lastFour"),
});

export const globalSetting = pgTable("GlobalSetting", {
  id: integer("id").primaryKey().default(1).notNull(),
  siteTitle: text("siteTitle").default("dir.zip").notNull(),
  siteDescription: text("siteDescription"),
});

// RELATIONS

export const tagRelations = relations(tag, ({ many }) => ({
  posts: many(postTags),
}));

export const broadcastRelations = relations(broadcast, ({ many, one }) => ({
  post: one(post, { fields: [broadcast.postId], references: [post.id] }),
  users: many(userBroadcast),
  lists: many(listBroadcast)
}))

export const userBroadcast = pgTable('UserBroadcast', {
  id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  broadcastId: text('broadcastId').notNull().references(() => broadcast.id, { onDelete: "restrict", onUpdate: "cascade" }),
});
export const userBroadcastRelations = relations(userBroadcast, ({ one }) => ({
  user: one(user, {
    fields: [userBroadcast.userId],
    references: [user.id],
  }),
  broadcast: one(broadcast, {
    fields: [userBroadcast.broadcastId],
    references: [broadcast.id],
  }),
}));

export const listBroadcastRelations = relations(listBroadcast, ({ one }) => ({
  list: one(list, {
    fields: [listBroadcast.listId],
    references: [list.id],
  }),
  broadcast: one(broadcast, {
    fields: [listBroadcast.broadcastId],
    references: [broadcast.id],
  }),
}));

export const userListRelations = relations(userList, ({ one }) => ({
  user: one(user, {
    fields: [userList.userId],
    references: [user.id],
  }),
  list: one(list, {
    fields: [userList.listId],
    references: [list.id],
  }),
}));

export const listRelations = relations(list, ({ many }) => ({
  broadcasts: many(listBroadcast),
  users: many(userList),
}));

export const userRelations = relations(user, ({ many, one }) => ({
  broadcasts: many(userBroadcast),
  lists: many(userList),
  posts: many(post),
  comments: many(comment),
  events: many(event),
  inventory: one(inventory, { fields: [user.inventoryId], references: [inventory.id] })
}))

export const postRelations = relations(post, ({ many, one }) => ({
  broadcasts: many(broadcast),
  tags: many(postTags),
  comments: many(comment),
  category: one(category, { fields: [post.categoryId], references: [category.id] }),
  user: one(user, { fields: [post.userId], references: [user.id] })
}))

export const globalSettingRelations = relations(globalSetting, ({ many }) => ({
  features: many(featureToggle)
}))

export const eventsRelations = relations(event, ({ one }) => ({
  user: one(user, {
    fields: [event.userId],
    references: [user.id],
  }),
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
    relationName: "CommentToComment",
  }),
  replies: many(comment, {
    relationName: "CommentToComment",
  }),
}));

export const featureToggleRelations = relations(featureToggle, ({ one }) => ({
  site: one(globalSetting, {
    fields: [featureToggle.globalSettingId],
    references: [globalSetting.id],
  }),
}));

export const badgeRelations = relations(badge, ({ many }) => ({
  conditions: many(condition)
}))

export const actionRelations = relations(action, ({ many }) => ({
  conditions: many(condition)
}))

export const conditionRelations = relations(condition, ({ one }) => ({
  badge: one(badge, {
    fields: [condition.badgeId],
    references: [badge.id],
  }),
  action: one(action, {
    fields: [condition.actionId],
    references: [action.id],
  }),
}))

export const inventoryRelations = relations(inventory, ({ many }) => ({
  inventoryItems: many(inventoryItem),
}));

export const inventoryItemRelations = relations(inventoryItem, ({ one }) => ({
  inventory: one(inventory, {
    fields: [inventoryItem.inventoryId],
    references: [inventory.id],
  }),
  item: one(item, {
    fields: [inventoryItem.itemId],
    references: [item.id],
  }),
  badge: one(badge, {
    fields: [inventoryItem.badgeId],
    references: [badge.id],
  }),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(post, {
    fields: [postTags.postId],
    references: [post.id],
  }),
  tag: one(tag, {
    fields: [postTags.tagId],
    references: [tag.id],
  }),
}));