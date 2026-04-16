import { createMemo, For } from 'solid-js';
import { MapTextData } from '~/lib/game-data/shared/map-text-data';
import { hkLangString } from '../../parser';
import { useGameplayStore } from '../store/gameplay-store';
import { useLocalizationStore } from '../store/localization-store';
import { changeRoomColorForLightTheme, useRoomColoringStore } from '../store/room-coloring-store';
import { useRoomDisplayStore } from '../store/room-display-store';
import { useThemeStore } from '../store/theme-store';

interface MapViewTextProps {
	textData: MapTextData;
	visibleBy: { zoneName: string } | boolean;
}

function MapViewText(props: MapViewTextProps) {
	const roomDisplayStore = useRoomDisplayStore();
	const roomColoringStore = useRoomColoringStore();
	const localizationStore = useLocalizationStore();
	const colorMode = roomColoringStore.colorMode;
	const themeStore = useThemeStore();
	const theme = themeStore.currentTheme;

	// color
	const fill = () => {
		if (theme() === 'light') {
			return colorMode() === 'area' ? changeRoomColorForLightTheme(props.textData.color) : 'rgba(0,0,0,0.8)';
		} else {
			return colorMode() === 'area' ? props.textData.color.formatHex() : 'rgba(255,255,255,0.8)';
		}
	};

	// opacity
	const opacity = () => {
		const typeVisible =
			props.textData.type === 'area' ? roomDisplayStore.showAreaNames() : roomDisplayStore.showSubAreaNames();

		const visible =
			typeVisible &&
			(typeof props.visibleBy === 'boolean'
				? props.visibleBy
				: roomDisplayStore.zoneVisible().get(props.visibleBy.zoneName)?.());
		return visible ? '1' : '0';
	};

	const text = createMemo(() => {
		const data = props.textData;
		if (data.textKey) {
			return localizationStore.getStringSilk(data.textKey as any);
		}
		return hkLangString(data.sheetName as any, data.convoName) ?? data.convoName;
	});

	return (
		<text
			class={
				'area-name-shadow pointer-events-none drop-shadow-md ' +
				(props.textData.type === 'area' ? 'font-serif' : 'font-serifMixedCase')
			}
			text-anchor="middle"
			dominant-baseline="central"
			x={props.textData.bounds.center.x}
			y={props.textData.bounds.center.y}
			style={{ ['font-size']: '3.25px', transition: 'opacity 0.1s ease 0s', fill: fill(), opacity: opacity() }}
		>
			{text()}
		</text>
	);
}

export function HkMapTexts() {
	const gameplayStore = useGameplayStore();
	const roomDisplayStore = useRoomDisplayStore();
	const roomTexts = createMemo(() => {
		return gameplayStore
			.gameModule()
			?.map.rooms?.flatMap(
				(room) =>
					room.texts
						.filter((text) => !text.objectPath.includes('Next Area'))
						.map((text) => ({ room, text })) ?? [],
			);
	});

	return (
		<g data-group="area-names">
			<For each={roomTexts()}>
				{(it) => {
					const states = roomDisplayStore.stateForGameObjectName(it.room.gameObjectName);
					return <MapViewText textData={it.text} visibleBy={states?.isVisible() ?? false} />;
				}}
			</For>
			<For each={gameplayStore.gameModule()?.map.areaTexts}>
				{(text) => (
					<MapViewText
						textData={text}
						visibleBy={{
							zoneName: text.convoName,
						}}
					/>
				)}
			</For>
		</g>
	);
}
