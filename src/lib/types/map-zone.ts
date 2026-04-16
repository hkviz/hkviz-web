import * as v from 'valibot';
import { mapZoneSchemaHollow } from '../game-data/hollow-data/map-zone-hollow';
import { mapZoneSilkSchema } from '../game-data/silk-data/map-zone-silk';

export const hollowOrSilkMapZoneSchema = v.picklist([...mapZoneSchemaHollow.options, ...mapZoneSilkSchema.options]);
