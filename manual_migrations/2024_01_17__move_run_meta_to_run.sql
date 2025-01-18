-- MAX

UPDATE hkviz.hkviz_run r
INNER JOIN (
    SELECT t1.*
    FROM hkviz.hkviz_runfile t1
    INNER JOIN
    (
        SELECT run_id as run_id, MAX(part_number) AS max_upload_part
        FROM hkviz.hkviz_runfile
        WHERE upload_finished = 1
        GROUP BY run_id
    ) t2
    ON t1.run_id = t2.run_id AND t1.part_number = t2.max_upload_part
) f ON r.id = f.run_id
SET 
r.hk_version = f.hk_version,
r.play_time = f.play_time,
r.max_health = f.max_health,
r.mp_reserve_max = f.mp_reserve_max,
r.geo = f.geo,
r.dream_orbs = f.dream_orbs,
r.permadeath_mode = f.permadeath_mode,
r.map_zone = f.map_zone,
r.killed_hollow_knight = f.killed_hollow_knight,
r.killed_final_boss = f.killed_final_boss,
r.killed_void_idol = f.killed_void_idol,
r.completion_percentage = f.completion_percentage,
r.unlocked_completion_rate = f.unlocked_completion_rate,
r.dream_nail_upgraded = f.dream_nail_upgraded,
r.last_scene = f.last_scene,

-- started_at = f.started_at, updated by min
r.ended_at = f.ended_at;

-- MIN

UPDATE hkviz.hkviz_run r
INNER JOIN (
    SELECT t1.*
    FROM hkviz.hkviz_runfile t1
    INNER JOIN
    (
        SELECT run_id as run_id, MIN(part_number) AS min_upload_part
        FROM hkviz.hkviz_runfile
        WHERE upload_finished = 1
        GROUP BY run_id
    ) t2
    ON t1.run_id = t2.run_id AND t1.part_number = t2.min_upload_part
) f ON r.id = f.run_id
SET 
r.started_at = f.started_at;