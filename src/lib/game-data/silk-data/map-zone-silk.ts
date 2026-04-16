import * as v from 'valibot';
import { MapZoneSilk as MapZoneSilkGen } from './player-data-silk.generated';

export const mapZoneSilkSchema = v.picklist(MapZoneSilkGen.nameList);

export type MapZoneSilk = v.InferOutput<typeof mapZoneSilkSchema>;
