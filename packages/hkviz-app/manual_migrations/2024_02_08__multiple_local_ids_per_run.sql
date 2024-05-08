-- because of bad choices in the past, local_id is called run_id in the run table
-- and run_id is called id: 

TRUNCATE TABLE hkviz_run_local_id;

INSERT INTO hkviz_run_local_id (local_id, user_id, run_id)
    SELECT run_id, user_id, id from hkviz_run;

UPDATE hkviz_runfile rf
    INNER JOIN hkviz_run r ON rf.run_id = r.id
    SET rf.local_id = r.run_id;