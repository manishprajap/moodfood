ALTER TABLE `categories` MODIFY `id` int NOT NULL AUTO_INCREMENT;
--> statement-breakpoint
INSERT IGNORE INTO `categories` (`name`, `slug`)
SELECT TRIM(`category`), LOWER(REPLACE(TRIM(`category`), ' ', '-'))
FROM `products`
WHERE TRIM(`category`) <> ''
GROUP BY TRIM(`category`);
--> statement-breakpoint
CREATE TABLE `subcategories` (
	`id` int NOT NULL AUTO_INCREMENT,
	`category_id` int NOT NULL,
	`name` varchar(80) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subcategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `subcategories_category_slug_unique` UNIQUE(`category_id`,`slug`)
);
--> statement-breakpoint
ALTER TABLE `subcategories` ADD CONSTRAINT `subcategories_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `subcategories_category_idx` ON `subcategories` (`category_id`);