CREATE TABLE `Action` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`title` text NOT NULL,
	`value` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Badge` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image` text
);
--> statement-breakpoint
CREATE TABLE `Broadcast` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`postId` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Category` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Comment` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`body` text NOT NULL,
	`postId` text NOT NULL,
	`userId` text NOT NULL,
	`parentId` text,
	FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Condition` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`actionId` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`badgeId` text NOT NULL,
	FOREIGN KEY (`actionId`) REFERENCES `Action`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`badgeId`) REFERENCES `Badge`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Event` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`userId` text NOT NULL,
	`actionId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`actionId`) REFERENCES `Action`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `FeatureToggle` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`feature` text NOT NULL,
	`isActive` integer NOT NULL,
	`globalSettingId` integer DEFAULT 1 NOT NULL,
	`value` text,
	FOREIGN KEY (`globalSettingId`) REFERENCES `GlobalSetting`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `GlobalSetting` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`siteTitle` text DEFAULT 'dir.zip' NOT NULL,
	`siteDescription` text
);
--> statement-breakpoint
CREATE TABLE `Inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `InventoryItem` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`inventoryId` text NOT NULL,
	`type` text NOT NULL,
	`equipped` integer NOT NULL,
	`itemId` text,
	`badgeId` text,
	FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`badgeId`) REFERENCES `Badge`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Item` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`price` integer NOT NULL,
	`effect` text
);
--> statement-breakpoint
CREATE TABLE `List` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `ListBroadcast` (
	`id` text PRIMARY KEY NOT NULL,
	`listId` text NOT NULL,
	`broadcastId` text NOT NULL,
	FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`broadcastId`) REFERENCES `Broadcast`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Post` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`body` text NOT NULL,
	`categoryId` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `PostTags` (
	`id` text PRIMARY KEY NOT NULL,
	`postId` text NOT NULL,
	`tagId` text NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`expiresAt` numeric,
	`hashedSessionToken` text,
	`csrfToken` text,
	`data` text,
	`userId` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Tag` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Token` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`hashedToken` text NOT NULL,
	`type` text NOT NULL,
	`expiresAt` numeric NOT NULL,
	`sentTo` text,
	`userId` text NOT NULL,
	`lastFour` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`hashedPassword` text,
	`role` text DEFAULT 'USER' NOT NULL,
	`avatar` text,
	`verified` numeric NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`bannerImage` text,
	`inventoryId` text
);
--> statement-breakpoint
CREATE TABLE `UserBroadcast` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`broadcastId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`broadcastId`) REFERENCES `Broadcast`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `UserList` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`listId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Action_title_unique` ON `Action` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `Category_slug_unique` ON `Category` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `FeatureToggle_feature_unique` ON `FeatureToggle` (`feature`);--> statement-breakpoint
CREATE UNIQUE INDEX `Inventory_userId_unique` ON `Inventory` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Item_effect_unique` ON `Item` (`effect`);--> statement-breakpoint
CREATE UNIQUE INDEX `List_slug_unique` ON `List` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `Post_slug_unique` ON `Post` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `Tag_slug_unique` ON `Tag` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `Token_hashedToken_unique` ON `Token` (`hashedToken`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_username_unique` ON `User` (`username`);