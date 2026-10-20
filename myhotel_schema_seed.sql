-- MyHotel: MySQL 8.0+ / MariaDB schema and sample data
-- Reconstructed from Laravel models: User, Room, RoomReservation, Role.
-- Run against a NEW, EMPTY database. No DROP TABLE statements included.
-- Example: mysql -u root -p myhotel < myhotel_schema_seed.sql
-- Demo account passwords for ALL seeded users: Demo12345!
-- These are test-only accounts. Replace passwords before any public deployment.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `birth` DATE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0 = ROLE_User; 1 = ROLE_Admin',
  `remember_token` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_name_unique` (`name`),
  CONSTRAINT `users_role_check` CHECK (`role` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `floor` INT UNSIGNED NOT NULL,
  `serial_number` INT UNSIGNED NOT NULL,
  `room_number` VARCHAR(30) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_room_number_unique` (`room_number`),
  UNIQUE KEY `rooms_floor_serial_unique` (`floor`, `serial_number`),
  CONSTRAINT `rooms_price_check` CHECK (`price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `room_reservations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `room_id` BIGINT UNSIGNED NOT NULL,
  `cost` DECIMAL(12, 2) NOT NULL,
  `days` INT UNSIGNED NOT NULL,
  `reserved_at` DATETIME DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_reservations_user_id_index` (`user_id`),
  KEY `room_reservations_room_id_status_index` (`room_id`, `status`),
  CONSTRAINT `room_reservations_user_fk` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `room_reservations_room_fk` FOREIGN KEY (`room_id`)
    REFERENCES `rooms` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `room_reservations_days_check` CHECK (`days` BETWEEN 1 AND 30),
  CONSTRAINT `room_reservations_cost_check` CHECK (`cost` >= 0),
  CONSTRAINT `room_reservations_status_check` CHECK (`status` IN ('PENDING', 'ACCEPTED', 'EXPIRED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

START TRANSACTION;

-- PHP password_hash('Demo12345!', PASSWORD_BCRYPT): all test accounts have the same demo password.
INSERT INTO `users` (`id`, `name`, `email`, `birth`, `password`, `role`, `created_at`, `updated_at`) VALUES
  (1, 'admin_demo', 'admin@myhotel.test', '1990-04-15', '$2y$12$wkjJawyRpK2CVDR8HbVTVuz1pBy7nQ8xGYyj1Fm6AyIG2NBIAGsDC', 1, '2026-10-15 09:00:00', '2026-10-15 09:00:00'),
  (2, 'guest_demo', 'guest@myhotel.test', '2002-10-17', '$2y$12$wkjJawyRpK2CVDR8HbVTVuz1pBy7nQ8xGYyj1Fm6AyIG2NBIAGsDC', 0, '2026-10-16 10:00:00', '2026-10-16 10:00:00'),
  (3, 'visitor_demo', 'visitor@myhotel.test', '2001-06-08', '$2y$12$wkjJawyRpK2CVDR8HbVTVuz1pBy7nQ8xGYyj1Fm6AyIG2NBIAGsDC', 0, '2026-10-17 11:00:00', '2026-10-17 11:00:00');

-- Room prices are per day (Ft) in the existing React demo examples.
INSERT INTO `rooms` (`id`, `floor`, `serial_number`, `room_number`, `price`) VALUES
  (1, 1, 1, '1-1', 10000.00),
  (2, 1, 2, '1-2', 15000.00),
  (3, 1, 3, '1-3', 18000.00),
  (4, 2, 1, '2-1', 25000.00),
  (5, 2, 2, '2-2', 27000.00),
  (6, 3, 1, '3-1', 30000.00);

-- One pending reservation per room in the seed, including an accepted and an expired example.
-- cost = days * price at the time of creation.
INSERT INTO `room_reservations`
  (`id`, `user_id`, `room_id`, `cost`, `days`, `reserved_at`, `status`, `created_at`, `updated_at`) VALUES
  (1, 2, 1, 50000.00, 5, NULL,                  'PENDING',  '2026-10-20 10:00:00', '2026-10-20 10:00:00'),
  (2, 3, 2, 30000.00, 2, '2026-10-20 12:00:00', 'ACCEPTED', '2026-10-19 11:00:00', '2026-10-20 12:00:00'),
  (3, 2, 3, 18000.00, 1, '2026-10-18 09:00:00', 'EXPIRED',  '2026-10-17 14:00:00', '2026-10-19 09:00:00'),
  (4, 3, 4, 50000.00, 2, NULL,                  'PENDING',  '2026-10-20 15:00:00', '2026-10-20 15:00:00');

COMMIT;

-- Check that relational lookups work as expected.
SELECT rr.id AS reservation_id, u.name AS user_name,
       r.room_number, r.floor, rr.days, rr.cost, rr.status
FROM `room_reservations` AS rr
JOIN `users` AS u ON u.id = rr.user_id
JOIN `rooms` AS r ON r.id = rr.room_id
ORDER BY rr.id;

-- The Room.php status accessor is computed from reservations, not stored in rooms.
-- Status logic in that accessor should be reviewed separately for expired reservations.
