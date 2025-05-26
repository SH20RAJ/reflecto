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
CREATE TABLE `newsletter_subscriptions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscriptions_email_unique` ON `newsletter_subscriptions` (`email`);