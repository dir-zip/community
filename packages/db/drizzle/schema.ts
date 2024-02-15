import { sqliteTable, uniqueIndex, text, numeric, integer, foreignKey, index } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"
import { createId } from '@paralleldrive/cuid2';

export const user = sqliteTable("User", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  email: text("email").notNull(),
  username: text("username").notNull(),
  hashedPassword: text("hashedPassword"),
  role: text("role").default("USER").notNull(),
  avatar: text("avatar"),
  verified: numeric("verified").notNull(),
  points: integer("points").default(0).notNull(),
  bannerImage: text("bannerImage"),
},
  (table) => {
    return {
      usernameKey: uniqueIndex("User_username_key").on(table.username),
      emailKey: uniqueIndex("User_email_key").on(table.email),
    }
  });

export const session = sqliteTable("Session", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  expiresAt: numeric("expiresAt"),
  hashedSessionToken: text("hashedSessionToken"),
  csrfToken: text("csrfToken"),
  data: text("data"),
  userId: text("userId").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
});

export const post = sqliteTable("Post", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  body: text("body").notNull(),
  categoryId: text("categoryId").notNull().references(() => category.id, { onDelete: "restrict", onUpdate: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
},
  (table) => {
    return {
      slugKey: uniqueIndex("Post_slug_key").on(table.slug),
    }
  });

export const comment = sqliteTable("Comment", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  body: text("body").notNull(),
  postId: text("postId").notNull().references(() => post.id, { onDelete: "restrict", onUpdate: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  parentId: text("parentId"),
},
  (table) => {
    return {
      commentParentIdCommentIdFk: foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
        name: "Comment_parentId_Comment_id_fk"
      }).onUpdate("cascade").onDelete("set null"),
    }
  });


export const item = sqliteTable("Item", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  price: integer("price").notNull(),
  effect: text("effect"),
},
  (table) => {
    return {
      effectKey: uniqueIndex("Item_effect_key").on(table.effect),
    }
  });

export const badge = sqliteTable("Badge", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
});

export const action = sqliteTable("Action", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  value: integer("value").notNull(),
},
  (table) => {
    return {
      titleKey: uniqueIndex("Action_title_key").on(table.title),
    }
  });

export const tag = sqliteTable("Tag", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
},
  (table) => {
    return {
      slugKey: uniqueIndex("Tag_slug_key").on(table.slug),
    }
  });

export const category = sqliteTable("Category", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
},
  (table) => {
    return {
      slugKey: uniqueIndex("Category_slug_key").on(table.slug),
    }
  });

export const event = sqliteTable("Event", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  actionId: text("actionId").notNull().references(() => action.id, { onDelete: "restrict", onUpdate: "cascade" }),
});

export const inventory = sqliteTable("Inventory", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
},
  (table) => {
    return {
      userIdKey: uniqueIndex("Inventory_userId_key").on(table.userId),
    }
  });

export const inventoryItem = sqliteTable("InventoryItem", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  inventoryId: text("inventoryId").notNull().references(() => inventory.id, { onDelete: "restrict", onUpdate: "cascade" }),
  type: text("type").notNull(),
  equipped: numeric("equipped").notNull(),
  itemId: text("itemId").references(() => item.id, { onDelete: "set null", onUpdate: "cascade" }),
  badgeId: text("badgeId").references(() => badge.id, { onDelete: "set null", onUpdate: "cascade" }),
});

export const condition = sqliteTable("Condition", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  actionId: text("actionId").notNull().references(() => action.id, { onDelete: "restrict", onUpdate: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  badgeId: text("badgeId").notNull().references(() => badge.id, { onDelete: "restrict", onUpdate: "cascade" }),
});

export const featureToggle = sqliteTable("FeatureToggle", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  feature: text("feature").notNull(),
  isActive: integer('isActive', { mode: 'boolean' }).notNull(),
  globalSettingId: integer("globalSettingId").default(1).notNull().references(() => globalSetting.id, { onDelete: "restrict", onUpdate: "cascade" }),
  value: text("value"),
},
  (table) => {
    return {
      featureKey: uniqueIndex("FeatureToggle_feature_key").on(table.feature),
    }
  });

export const broadcast = sqliteTable("Broadcast", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  postId: text("postId").notNull().references(() => post.id, { onDelete: "restrict", onUpdate: "cascade" }),
  status: text("status").notNull(),
});

export const postToTag = sqliteTable("_PostToTag", {
  a: text("A").notNull().references(() => post.id, { onDelete: "cascade", onUpdate: "cascade" }),
  b: text("B").notNull().references(() => tag.id, { onDelete: "cascade", onUpdate: "cascade" }),
},
  (table) => {
    return {
      bIdx: index("_PostToTag_B_index").on(table.b),
      abUnique: uniqueIndex("_PostToTag_AB_unique").on(table.a, table.b),
    }
  });



export const broadcastToList = sqliteTable("_BroadcastToList", {
  a: text("A").notNull().references(() => broadcast.id, { onDelete: "cascade", onUpdate: "cascade" }),
  b: text("B").notNull().references(() => list.id, { onDelete: "cascade", onUpdate: "cascade" }),
},
  (table) => {
    return {
      bIdx: index("_BroadcastToList_B_index").on(table.b),
      abUnique: uniqueIndex("_BroadcastToList_AB_unique").on(table.a, table.b),
    }
  });

export const listToUser = sqliteTable("_ListToUser", {
  a: text("A").notNull().references(() => list.id, { onDelete: "cascade", onUpdate: "cascade" }),
  b: text("B").notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
},
  (table) => {
    return {
      bIdx: index("_ListToUser_B_index").on(table.b),
      abUnique: uniqueIndex("_ListToUser_AB_unique").on(table.a, table.b),
    }
  });

export const list = sqliteTable("List", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
},
  (table) => {
    return {
      slugKey: uniqueIndex("List_slug_key").on(table.slug),
    }
  });

export const broadcastToUser = sqliteTable("_BroadcastToUser", {
  a: text("A").notNull().references(() => broadcast.id, { onDelete: "cascade", onUpdate: "cascade" }),
  b: text("B").notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
},
  (table) => {
    return {
      bIdx: index("_BroadcastToUser_B_index").on(table.b),
      abUnique: uniqueIndex("_BroadcastToUser_AB_unique").on(table.a, table.b),
    }
  });

export const token = sqliteTable("Token", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  createdAt: numeric("createdAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric("updatedAt").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  hashedToken: text("hashedToken").notNull(),
  type: text("type").notNull(),
  expiresAt: numeric("expiresAt").notNull(),
  sentTo: text("sentTo"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  lastFour: text("lastFour"),
},
  (table) => {
    return {
      hashedTokenTypeKey: uniqueIndex("Token_hashedToken_type_key").on(table.hashedToken, table.type),
    }
  });

export const globalSetting = sqliteTable("GlobalSetting", {
  id: integer("id").default(1).notNull(),
  siteTitle: text("siteTitle").default("dir.zip").notNull(),
  siteDescription: text("siteDescription"),
},
  (table) => {
    return {
      idKey: uniqueIndex("GlobalSetting_id_key").on(table.id),
    }
  });
