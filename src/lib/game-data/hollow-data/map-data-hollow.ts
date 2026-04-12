import * as d3 from 'd3';
import { hollowScaleBounds } from '~/lib/game-data/hollow-data/hollow-scaling';
import { roomDataConditionalByGameObjectName } from '~/lib/game-data/hollow-data/map-rooms-conditionals.generated';
import { roomDataUnscaledFinishedGame } from '~/lib/game-data/hollow-data/map-rooms-finished.generated';
import { roomDataUnscaled } from '~/lib/game-data/hollow-data/map-rooms.generated';
import { Bounds } from '~/lib/game-data/shared/bounds';
import { colorFromRgbVector } from '~/lib/game-data/shared/colors';
import { spriteInfoBounds } from '~/lib/game-data/shared/sprite-info-mapper';
import { Vector2 } from '~/lib/game-data/shared/vectors';
import { prepareTextExportData } from '../../parser/map-data/area-names';
import { customRoomData, type CustomRoomInfo, type UnprocessedRoomInfo } from '../../parser/map-data/room-custom';
import { roomGroupByName } from '../../parser/map-data/room-groups';
import { getSubSprites } from '../../parser/map-data/room-sub-sprites';
import { getZoomZones } from '../../parser/map-data/zoom-zone';
import { omit } from '../../util';
import { formatZoneAndRoomNameHollow } from './room-name-formatting-hollow';

const roomDataUnscaledWithCustom: Array<UnprocessedRoomInfo | CustomRoomInfo> = [
	...roomDataUnscaled.rooms,
	...customRoomData,
];

// some order changes, so hover works better:
const resortings = [
	{
		move: 'Waterways_07',
		after: 'Waterways_14',
	},
	{
		move: 'Fungus3_48_top',
		after: 'Fungus3_48',
	},
	{
		move: 'White_Palace_19',
		after: 'White_Palace_20',
	},
	{
		move: 'White_Palace_17',
		after: 'White_Palace_19',
	},
];

resortings.forEach((resort) => {
	const moveIndex = roomDataUnscaledWithCustom.findIndex((it) => it.gameObjectName === resort.move);
	const afterIndex = roomDataUnscaledWithCustom.findIndex((it) => it.gameObjectName === resort.after);
	const move = roomDataUnscaledWithCustom.splice(moveIndex, 1)[0]!;
	roomDataUnscaledWithCustom.splice(afterIndex + 1, 0, move);
});

// logPossibleConditionals();

export type RoomDataHollow = (typeof mapRoomsHollow)[number];
export type SpriteVariants = RoomDataHollow['spritesByVariant'];
export type SpriteInfo = SpriteVariants['normal'] | SpriteVariants['rough'];

// some rooms have multiple game objects, we need the 'main' one, which is used to determine how to map onto the map.
// In the game this will always be the one with the shortest name, since additional sprites for a room
// contain a suffix like Crossroads_04 and Crossroads_04_b
const mainGameObjectNamePerSceneName = Object.fromEntries(
	[...d3.group(roomDataUnscaledWithCustom, (d) => d.sceneName).entries()].map(([sceneName, roomGroup]) => {
		return [
			sceneName,
			roomGroup.sort((a, b) => a.gameObjectName.length - b.gameObjectName.length)[0]!.gameObjectName,
		];
	}),
);

export type RoomSpriteVariantHollow = 'rough' | 'normal' | 'conditional';

const finishedUnprocessedRoomsByGameObjectName = new Map(
	roomDataUnscaledFinishedGame.rooms.map((room) => [room.gameObjectName, room] as const),
);

export const mapRoomsHollow = roomDataUnscaledWithCustom.flatMap((room) => {
	const finishedRoom = finishedUnprocessedRoomsByGameObjectName.get(room.gameObjectName);
	const visualBounds = hollowScaleBounds(room.visualBounds);
	const playerPositionBounds = hollowScaleBounds(finishedRoom?.playerPositionBounds ?? room.playerPositionBounds);
	const isMainGameObject = room.gameObjectName === mainGameObjectNamePerSceneName[room.sceneName];

	function spriteInfoWithScaledPosition<
		T extends Exclude<typeof room.roughSpriteInfo | typeof room.spriteInfo, null | undefined>,
	>(variant: RoomSpriteVariantHollow, spriteInfo: T) {
		return {
			...spriteInfo,
			nameWithoutSubSprites: null as null | string,
			variant,
			alwaysHidden: false,
			sprite: {
				name: spriteInfo.name,
				visualBounds: spriteInfoBounds(visualBounds, spriteInfo),
			},
		};
	}

	// extra handling of additional map mod:
	const origColor = d3.hsl(
		room.mapZone === 'GODS_GLORY'
			? d3.color('#f8ecd7')!
			: room.mapZone === 'WHITE_PALACE'
				? d3.color('#dfe2e4')!
				: colorFromRgbVector(room.origColor),
	);

	const conditionalSpriteInfo = roomDataConditionalByGameObjectName(room.gameObjectName);

	const spritesByVariant = {
		normal: spriteInfoWithScaledPosition('normal', room.spriteInfo),
		conditional: conditionalSpriteInfo ? spriteInfoWithScaledPosition('conditional', conditionalSpriteInfo) : null,
		rough: room.roughSpriteInfo ? spriteInfoWithScaledPosition('rough', room.roughSpriteInfo) : null,
	};
	const allSprites = Object.values(spritesByVariant).filter((it): it is NonNullable<typeof it> => !!it);
	const visualBoundsAllSprites = Bounds.fromContainingBounds(allSprites.map((it) => it.sprite.visualBounds));

	const texts = room.texts.map((text) => prepareTextExportData(text));

	const names = formatZoneAndRoomNameHollow(room.mapZone, room.sceneName);
	const zoomZones = getZoomZones(room.sceneName, names.zoneNameFormatted);

	const roomCorrected = {
		game: 'hollow' as const,
		...omit(room, ['sprite', 'spriteInfo']),
		...names,
		zoomZones,
		spritesByVariant,
		allSprites,
		visualBoundsAllSprites,
		visualBounds,
		playerPositionBounds,
		origColor,
		isMainGameObject,
		gameObjectNameNeededInVisited:
			'gameObjectNameNeededInVisited' in room && room.gameObjectNameNeededInVisited
				? room.gameObjectNameNeededInVisited
				: room.gameObjectName,
		texts,
		subSpriteOfGameObjectName: null as null | string,
	};

	const subSprites = getSubSprites(room.spriteInfo.name);
	if (subSprites) {
		const { normal, conditional, rough } = subSprites.parentSpriteWithoutSubSprites;
		if (normal) {
			roomCorrected.spritesByVariant.normal.nameWithoutSubSprites = normal;
		}
		if (conditional) {
			roomCorrected.spritesByVariant.conditional!.nameWithoutSubSprites = conditional;
		}
		if (rough) {
			roomCorrected.spritesByVariant.rough!.nameWithoutSubSprites = rough;
		}
	}
	const subSpritesCorrected = (subSprites?.childSprites ?? []).map((childSprite) => {
		function subSpriteInfoWithScaledPosition<TVariant extends RoomSpriteVariantHollow>(
			variant: TVariant,
		): (typeof roomCorrected.spritesByVariant)[TVariant] {
			const parentSpriteInfo = spritesByVariant[variant as RoomSpriteVariantHollow];
			const childVariant = childSprite[variant];

			if (!childVariant || !parentSpriteInfo) {
				return null!;
			}

			const parentSpriteSizeWithoutPadding = new Vector2(
				parentSpriteInfo.size.x - parentSpriteInfo.padding.x - parentSpriteInfo.padding.z,
				parentSpriteInfo.size.y - parentSpriteInfo.padding.y - parentSpriteInfo.padding.w,
			);

			const subSpriteInfo = {
				name: childVariant.name,
				nameWithoutSubSprites: null as null | string,
				variant,
				size: childVariant.size,
				padding: parentSpriteInfo.padding,
				sprite: {
					name: childVariant.name,
					visualBounds: Bounds.fromMinSize(
						new Vector2(
							parentSpriteInfo.sprite.visualBounds.min.x +
								childVariant.offsetTop.x *
									(parentSpriteInfo.sprite.visualBounds.size.x / parentSpriteSizeWithoutPadding.x),

							parentSpriteInfo.sprite.visualBounds.min.y +
								childVariant.offsetTop.y *
									(parentSpriteInfo.sprite.visualBounds.size.y / parentSpriteSizeWithoutPadding.y),
						),
						new Vector2(
							childVariant.size.x *
								(parentSpriteInfo.sprite.visualBounds.size.x / parentSpriteSizeWithoutPadding.x),
							childVariant.size.y *
								(parentSpriteInfo.sprite.visualBounds.size.y / parentSpriteSizeWithoutPadding.y),
						),
					),
				},
				alwaysHidden: 'alwaysHidden' in childVariant ? (childVariant.alwaysHidden as boolean) : false,
			} satisfies typeof parentSpriteInfo;

			if ('conditionalOn' in parentSpriteInfo) {
				(subSpriteInfo as any).conditionalOn = parentSpriteInfo.conditionalOn;
			}

			return subSpriteInfo as any;
		}

		const subSpritesByVariant = {
			normal: subSpriteInfoWithScaledPosition('normal'),
			conditional: subSpriteInfoWithScaledPosition('conditional'),
			rough: subSpriteInfoWithScaledPosition('rough'),
		} as (typeof roomCorrected)['spritesByVariant'];

		const subSprites = Object.values(subSpritesByVariant).filter((it): it is NonNullable<typeof it> => !!it);

		const escapedSpriteName = childSprite.normal.name.replace(/\//g, '_');

		const visualBounds = Bounds.fromContainingBounds(subSprites.map((it) => it.sprite.visualBounds));
		const playerPositionBounds = visualBounds;
		const visualBoundsAllSprites = visualBounds;

		return {
			...roomCorrected,
			...formatZoneAndRoomNameHollow(room.mapZone, childSprite.sceneName),
			sceneName: childSprite.sceneName,
			gameObjectName:
				roomCorrected.gameObjectName +
				'_' +
				('gameObjectName' in childSprite ? (childSprite.gameObjectName as string) : escapedSpriteName),
			spritesByVariant: subSpritesByVariant,
			allSprites: subSprites,
			gameObjectNameNeededInVisited: roomCorrected.gameObjectNameNeededInVisited,
			isMainGameObject: true,
			visualBounds,
			playerPositionBounds,
			visualBoundsAllSprites: visualBoundsAllSprites,
			subSpriteOfGameObjectName: roomCorrected.gameObjectName,
		} satisfies typeof roomCorrected;
	});

	return [roomCorrected, ...subSpritesCorrected];
});

export const roomDataByGameObjectName = new Map<string, RoomDataHollow>(
	mapRoomsHollow.map((room) => [room.gameObjectName, room] as const),
);

export const mainRoomDataBySceneName = new Map<string, RoomDataHollow>(
	mapRoomsHollow
		.filter((it) => it.isMainGameObject)
		.flatMap((room) => {
			const self = [room.sceneName, room] as const;
			const groupChildren = roomGroupByName.get(room.sceneName as never)?.sceneNames ?? [];
			return [self, ...groupChildren.map((scene) => [scene, room] as const)];
		}),
);

export const allRoomDataBySceneName = new Map<string, RoomDataHollow[]>(
	[...d3.group(mapRoomsHollow, (d) => d.sceneName).entries()].flatMap(([sceneName, rooms]) => {
		const self = [sceneName, rooms] as const;
		const groupChildren = roomGroupByName.get(sceneName as never)?.sceneNames ?? [];
		return [self, ...groupChildren.map((scene) => [scene, rooms] as const)];
	}),
);

export const allRoomDataIncludingSubspritesBySceneName = (() => {
	const map = new Map<string, RoomDataHollow[]>();
	function add(room: RoomDataHollow, sceneName: string) {
		let arr = map.get(sceneName);
		if (!arr) {
			arr = [];
			map.set(sceneName, arr);
		}
		arr.push(room);
	}

	mapRoomsHollow.forEach((room) => {
		add(room, room.sceneName);
		if (room.subSpriteOfGameObjectName) {
			const other = roomDataByGameObjectName.get(room.subSpriteOfGameObjectName)!;
			add(room, other.sceneName);
		}
	});

	return map;
})();
