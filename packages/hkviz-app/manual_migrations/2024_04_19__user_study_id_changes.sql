ALTER TABLE hkviz_userDemographic
DROP PRIMARY KEY,
    MODIFY COLUMN userId varchar(36),
    ADD COLUMN participant_id varchar(36),
    ADD COLUMN id SERIAL PRIMARY KEY;

ALTER TABLE hkviz_hkExperience
DROP PRIMARY KEY,
    MODIFY COLUMN userId varchar(36),
    ADD COLUMN participant_id varchar(36),
    ADD COLUMN id SERIAL PRIMARY KEY;
