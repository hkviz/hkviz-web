import { scaleBounds } from '../parser';
import { silkMapDataGenerated } from './silk-map.generated';
import { SilkTextDataGenerated } from './silk-map.generated.types';
import { SilkMapData, SilkMapRoomData, SilkTextData } from './silk-map.types';

function mapGeneratedText(text: SilkTextDataGenerated): SilkTextData {
	return {
		...text,
		bounds: scaleBounds(text.bounds),
	};
}

export const silkMapData: SilkMapData = {
	rooms: silkMapDataGenerated.rooms.map((room) => {
		const mappedRoom: SilkMapRoomData = {
			...room,
			visualBounds: room.visualBounds ? scaleBounds(room.visualBounds) : null,
			playerPositionBounds: room.playerPositionBounds ? scaleBounds(room.playerPositionBounds) : null,
			texts: room.texts.map(mapGeneratedText),
		};
		return mappedRoom;
	}),
	areaNames: silkMapDataGenerated.areaNames.map(mapGeneratedText),
};
