CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`metadata` blob,
	`token_count` integer,
	`is_error` integer DEFAULT 0,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`notebook_id` text,
	`personality` text DEFAULT 'friendly',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	`is_archived` integer DEFAULT 0 NOT NULL,
	`is_pinned` integer DEFAULT 0 NOT NULL,
	`summary` text,
	`last_message_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`status` text DEFAULT 'new' NOT NULL,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`rating` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `foo` (
	`bar` text DEFAULT 'Hey!' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscriptions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscriptions_email_unique` ON `newsletter_subscriptions` (`email`);--> statement-breakpoint
CREATE TABLE `notebooks` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '',
	`user_id` text NOT NULL,
	`is_public` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	`embedding` blob,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notebooks_tags` (
	`notebook_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`notebook_id`, `tag_id`),
	FOREIGN KEY (`notebook_id`) REFERENCES `notebooks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_token` text NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_session_token_unique` ON `sessions` (`session_token`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`username` text,
	`email` text NOT NULL,
	`email_verified` integer,
	`image` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
