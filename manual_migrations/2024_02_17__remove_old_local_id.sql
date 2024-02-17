
DROP INDEX uniqueLocalIdUserId ON hkviz_run;
ALTER TABLE hkviz_run DROP COLUMN run_id;
ALTER TABLE hkviz_run DROP COLUMN last_completed_run_file_part_number;

