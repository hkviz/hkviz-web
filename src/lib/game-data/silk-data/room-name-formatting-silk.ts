import { typeCheckNever } from '~/lib/parser';
import { MapZoneSilk } from './map-data-silk.types';

export function formatAreaNameSilk(mapZone: MapZoneSilk) {
	switch (mapZone) {
		case 'Bonetown':
			return 'Bone Bottom'; // TODO
		case 'Greymoor':
			return 'Greymoor';
		case 'Shellwood':
			return 'Shellwood';
		case 'Belltown':
			return 'Bellhart';
		case 'Wilds':
			return 'Far Fields';
		case 'Slab':
			return 'The Slab';
		case 'Under':
			return 'Underworks';
		case 'Swamp':
			return 'Bilewater';
		case 'Crawl':
			return 'Wormways';
		case 'Dock':
			return 'Deep Docks';
		case 'Weavehome':
			return 'Weavenest Atla';
		case 'Peak':
			return 'Mount Fay';
		case 'Song':
			return 'Songclave';
		case 'Ward':
			return 'The Citadel';
		case 'Clover':
			return 'Clover';
		case 'Abyss':
			return 'The Abyss';
		case 'Tut':
			return 'Moss Grotto';
		case 'Bone':
			return 'The Marrow';
		case 'Ant':
			return "Hunter's March";
		case 'Dust':
			return 'Sands of Karak'; // TODO
		case 'Dust Maze':
			return 'Sands of Karak'; // TODO
		case 'Wisp':
			return 'Wisp Thicket';
		case 'Aqueduct':
			return 'Putrified Ducts';
		case 'Blasted_Steps':
			return 'Blasted Steps';
		case 'Coral_Caves':
			return 'Coral Caves';
		case 'Song_Gate':
			return 'Grand Gate';
		case 'Library':
			return 'Memorium'; // TODO
		case 'Cog':
			return 'Cogwork Core';
		case 'Hang':
			return 'High Halls';
		case 'Arborium':
			return 'Memorium'; // TODO
		case 'Cradle':
			return 'The Cradle';

		case 'Surface':
			return 'Outer Pharloom';
		default: {
			typeCheckNever(mapZone);
			return mapZone as string;
		}
	}
}
