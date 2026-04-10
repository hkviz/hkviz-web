import { Bounds } from '../shared/bounds.js';
import { SpriteInfoGenerated } from '../shared/sprite-info-generated.js';
import { spriteInfoBounds } from '../shared/sprite-info-mapper.js';
import { silkMapDataGenerated } from './silk-map.generated.js';
import { SilkTextDataGenerated } from './silk-map.generated.types.js';
import {
	SilkMapData,
	SilkMapRoomData,
	SilkSomeSpriteType,
	SilkSpriteConditionData,
	SilkSpriteInfo,
	SilkTextData,
} from './silk-map.types.js';
import { silkScaleBounds } from './silk-scaling.js';

function mapGeneratedText(text: SilkTextDataGenerated): SilkTextData {
	return {
		...text,
		bounds: silkScaleBounds(text.bounds),
	};
}

function mapSpriteInfo(roomBounds: Bounds | null, sprite: SpriteInfoGenerated): SilkSpriteInfo {
	if (!roomBounds) {
		throw new Error('Sprite info requires room bounds to calculate visual bounds');
	}
	const bounds = spriteInfoBounds(roomBounds, sprite);
	return {
		...sprite,
		bounds,
	};
}

export const silkMapData: SilkMapData = {
	rooms: silkMapDataGenerated.rooms.map((room) => {
		const visualBounds = room.visualBounds ? silkScaleBounds(room.visualBounds) : null;

		const altFullSprites: SilkSpriteConditionData[] | null =
			room.altFullSprites?.map((s) => ({
				type: 'alt-full-sprite',
				sprite: mapSpriteInfo(visualBounds, s.sprite),
				condition: s.condition,
			})) ?? null;

		const initialSprite = room.initialSprite ? mapSpriteInfo(visualBounds, room.initialSprite) : null;
		const fullSprite = room.fullSprite ? mapSpriteInfo(visualBounds, room.fullSprite) : null;
		const rendererSprite = room.hasSpriteRenderer && !room.initialSprite ? fullSprite : null;

		const allSprites: SilkSomeSpriteType[] = [
			initialSprite ? { type: 'initial', sprite: initialSprite } : null,
			fullSprite ? { type: 'full', sprite: fullSprite } : null,
			rendererSprite ? { type: 'renderer', sprite: rendererSprite } : null,
			...(altFullSprites ?? []),
		].filter((s): s is SilkSomeSpriteType => s !== null);

		const mappedRoom: SilkMapRoomData = {
			...room,
			visualBounds: room.visualBounds ? silkScaleBounds(room.visualBounds) : null,
			playerPositionBounds: room.playerPositionBounds ? silkScaleBounds(room.playerPositionBounds) : null,
			texts: room.texts.map(mapGeneratedText),
			allSprites,
		};
		return mappedRoom;
	}),
	areaNames: silkMapDataGenerated.areaNames.map(mapGeneratedText),
};

silkMapData.rooms.sort((a, b) => {
	if (a.sortingOrder !== b.sortingOrder) {
		return a.sortingOrder - b.sortingOrder;
	}
	if (a.positionZ !== b.positionZ) {
		return b.positionZ - a.positionZ;
	}
	return 0;
});

export const silkMapDataBySceneNameLower = new Map(silkMapData.rooms.map((it) => [it.sceneName.toLowerCase(), it]));
