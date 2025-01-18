UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_first_playthrough = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'first-playthrough'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_casual = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'casual'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_randomizer = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'randomizer'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_item_sync = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'item-sync'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_any = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_any'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_112 = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_112'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_true = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_true'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_106 = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_106'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_godhome = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_godhome'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_low = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_low'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_low_true = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_low_true'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_low_godhome = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_low_godhome'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_all_skills = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_all_skills'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_great_hopper = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_great_hopper'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_eat_me_too = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_eat_me_too'
;
UPDATE
    hkviz.hkviz_run AS r, hkviz.hkviz_runTag t
SET
    r.tag_speedrun_other = TRUE
WHERE
    r.id = t.run_id AND t.tag = 'speedrun_other'
;