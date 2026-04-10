import * as v from 'valibot';
import { hollowMapZoneSchema } from '../game-data/hollow-data/hollow-map-zone';
import { silkMapZoneSchema } from '../game-data/silk-data/silk-map-zone';

export const hollowOrSilkMapZoneSchema = v.picklist([...hollowMapZoneSchema.options, ...silkMapZoneSchema.options]);
