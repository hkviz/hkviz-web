import * as v from 'valibot';
import { GlobalEnums_MapZoneSilk } from './player-data-silk.generated';

export const mapZoneSilkSchema = v.picklist(GlobalEnums_MapZoneSilk.nameList);

export type MapZoneSilk = v.InferOutput<typeof mapZoneSilkSchema>;
