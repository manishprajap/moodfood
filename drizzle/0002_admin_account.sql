CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(254) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
INSERT IGNORE INTO `admins` (`email`, `password_hash`)
VALUES ('admin@gmail.com', 'scrypt$6a634ba11d1bd80a105d98341e741775$86e121600a92f62fea8b1bed99a93448994b7e55bb8cb541393b64dc4b6e7bb3ecc93eb6adb771dd44164d6a4046c325262709a798fbcb7c2c184f676434b4b2');
