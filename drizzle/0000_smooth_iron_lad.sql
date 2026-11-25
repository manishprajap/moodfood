CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`name` varchar(80) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120),
	`phone` varchar(16) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36),
	`product_name` varchar(150) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` int NOT NULL,
	`line_total` int NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`order_number` varchar(32) NOT NULL,
	`customer_id` varchar(36),
	`customer_name` varchar(120) NOT NULL,
	`phone` varchar(16) NOT NULL,
	`delivery_address` text NOT NULL,
	`requested_delivery_at` datetime NOT NULL,
	`status` enum('pending','confirmed','preparing','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`payment_status` enum('pending','paid','refunded') NOT NULL DEFAULT 'pending',
	`payment_method` varchar(40) NOT NULL DEFAULT 'upi',
	`subtotal` int NOT NULL,
	`gst_amount` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`customer_note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_number_unique` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`name` varchar(150) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`cuisine` varchar(80) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`pack` varchar(60) NOT NULL,
	`weight_grams` int NOT NULL DEFAULT 500,
	`vegetarian` boolean NOT NULL DEFAULT false,
	`frozen` boolean NOT NULL DEFAULT false,
	`badge` varchar(80),
	`image` varchar(500) NOT NULL,
	`ingredients` text,
	`nutrition` json,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` varchar(36) NOT NULL,
	`title` varchar(160) NOT NULL,
	`code` varchar(40),
	`message` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`starts_at` datetime,
	`ends_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` varchar(120) NOT NULL,
	`value` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `orders_status_created_idx` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_phone_idx` ON `orders` (`phone`);--> statement-breakpoint
CREATE INDEX `products_category_active_idx` ON `products` (`category`,`is_active`);