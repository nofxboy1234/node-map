CREATE TABLE `incident_events` (
	`id` text PRIMARY KEY,
	`incident_id` text NOT NULL,
	`type` text NOT NULL,
	`actor_id` text,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_incident_events_incident_id_incidents_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `incident_reports` (
	`id` text PRIMARY KEY,
	`incident_id` text NOT NULL,
	`report_id` text NOT NULL,
	CONSTRAINT `fk_incident_reports_incident_id_incidents_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_incident_reports_report_id_reports_id_fk` FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY,
	`description` text NOT NULL,
	`location_x` real NOT NULL,
	`location_y` real NOT NULL,
	`devil_type` text,
	`urgency` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sightings` (
	`id` text PRIMARY KEY,
	`incident_id` text NOT NULL,
	`position_x` real NOT NULL,
	`position_y` real NOT NULL,
	`source` text NOT NULL,
	`confidence` real NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_sightings_incident_id_incidents_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `incident_events_incident_id_created_at_idx` ON `incident_events` (`incident_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `incident_reports_incident_id_idx` ON `incident_reports` (`incident_id`);--> statement-breakpoint
CREATE INDEX `incident_reports_report_id_idx` ON `incident_reports` (`report_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `incident_reports_incident_id_report_id_uidx` ON `incident_reports` (`incident_id`,`report_id`);--> statement-breakpoint
CREATE INDEX `incidents_status_idx` ON `incidents` (`status`);--> statement-breakpoint
CREATE INDEX `incidents_created_at_idx` ON `incidents` (`created_at`);--> statement-breakpoint
CREATE INDEX `reports_status_idx` ON `reports` (`status`);--> statement-breakpoint
CREATE INDEX `reports_created_at_idx` ON `reports` (`created_at`);--> statement-breakpoint
CREATE INDEX `sightings_incident_id_created_at_idx` ON `sightings` (`incident_id`,`created_at`);