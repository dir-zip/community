CREATE TABLE IF NOT EXISTS "Action" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"title" text NOT NULL,
	"value" integer NOT NULL,
	CONSTRAINT "Action_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Badge" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Broadcast" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"postId" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Category" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "Category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Comment" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"body" text NOT NULL,
	"postId" text NOT NULL,
	"userId" text NOT NULL,
	"parentId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Condition" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"actionId" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"badgeId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"userId" text NOT NULL,
	"actionId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FeatureToggle" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"feature" text NOT NULL,
	"isActive" boolean NOT NULL,
	"globalSettingId" integer DEFAULT 1 NOT NULL,
	"value" text,
	CONSTRAINT "FeatureToggle_feature_unique" UNIQUE("feature")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GlobalSetting" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"siteTitle" text DEFAULT 'dir.zip' NOT NULL,
	"siteDescription" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "Inventory_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InventoryItem" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"inventoryId" text NOT NULL,
	"type" text NOT NULL,
	"equipped" boolean NOT NULL,
	"itemId" text,
	"badgeId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Item" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image" text,
	"price" integer NOT NULL,
	"effect" text,
	CONSTRAINT "Item_effect_unique" UNIQUE("effect")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "List" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	CONSTRAINT "List_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ListBroadcast" (
	"id" text PRIMARY KEY NOT NULL,
	"listId" text NOT NULL,
	"broadcastId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Post" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"body" text NOT NULL,
	"categoryId" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "Post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PostTags" (
	"id" text PRIMARY KEY NOT NULL,
	"postId" text NOT NULL,
	"tagId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"expiresAt" numeric,
	"hashedSessionToken" text,
	"csrfToken" text,
	"data" text,
	"userId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Tag" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "Tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Token" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"hashedToken" text NOT NULL,
	"type" text NOT NULL,
	"expiresAt" numeric NOT NULL,
	"sentTo" text,
	"userId" text NOT NULL,
	"lastFour" text,
	CONSTRAINT "Token_hashedToken_unique" UNIQUE("hashedToken")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"updatedAt" timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"hashedPassword" text,
	"role" text DEFAULT 'USER' NOT NULL,
	"avatar" text,
	"verified" boolean DEFAULT false NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"bannerImage" text,
	"inventoryId" text,
	CONSTRAINT "User_email_unique" UNIQUE("email"),
	CONSTRAINT "User_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserBroadcast" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"broadcastId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserList" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"listId" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_postId_Post_id_fk" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_Post_id_fk" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Condition" ADD CONSTRAINT "Condition_actionId_Action_id_fk" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Condition" ADD CONSTRAINT "Condition_badgeId_Badge_id_fk" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_actionId_Action_id_fk" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FeatureToggle" ADD CONSTRAINT "FeatureToggle_globalSettingId_GlobalSetting_id_fk" FOREIGN KEY ("globalSettingId") REFERENCES "GlobalSetting"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_inventoryId_Inventory_id_fk" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_itemId_Item_id_fk" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_badgeId_Badge_id_fk" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ListBroadcast" ADD CONSTRAINT "ListBroadcast_listId_List_id_fk" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ListBroadcast" ADD CONSTRAINT "ListBroadcast_broadcastId_Broadcast_id_fk" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_Category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PostTags" ADD CONSTRAINT "PostTags_postId_Post_id_fk" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PostTags" ADD CONSTRAINT "PostTags_tagId_Tag_id_fk" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserBroadcast" ADD CONSTRAINT "UserBroadcast_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserBroadcast" ADD CONSTRAINT "UserBroadcast_broadcastId_Broadcast_id_fk" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserList" ADD CONSTRAINT "UserList_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserList" ADD CONSTRAINT "UserList_listId_List_id_fk" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
