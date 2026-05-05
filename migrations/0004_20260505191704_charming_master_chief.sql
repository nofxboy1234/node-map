ALTER TABLE `incidents` ADD `location_x` real;--> statement-breakpoint
ALTER TABLE `incidents` ADD `location_y` real;--> statement-breakpoint
UPDATE `incidents`
SET
	`location_x` = (
		SELECT `reports`.`location_x`
		FROM `incident_reports`
		INNER JOIN `reports` ON `reports`.`id` = `incident_reports`.`report_id`
		WHERE `incident_reports`.`incident_id` = `incidents`.`id`
		ORDER BY `reports`.`created_at`
		LIMIT 1
	),
	`location_y` = (
		SELECT `reports`.`location_y`
		FROM `incident_reports`
		INNER JOIN `reports` ON `reports`.`id` = `incident_reports`.`report_id`
		WHERE `incident_reports`.`incident_id` = `incidents`.`id`
		ORDER BY `reports`.`created_at`
		LIMIT 1
	);
