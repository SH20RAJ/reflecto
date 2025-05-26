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
ALTER TABLE `notebooks` ADD `embedding` blob;