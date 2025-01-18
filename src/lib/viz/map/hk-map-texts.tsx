import { For } from 'solid-js';
import { areaNames, hkLangString, roomData, type AreaNameTextData } from '../../parser';
import { changeRoomColorForLightTheme, useRoomColoringStore, useRoomDisplayStore, useThemeStore } from '../store';

interface HkMapTextProps {
	textData: AreaNameTextData;
	visibleBy: { gameObjectName: string } | { zoneName: string };
}

function HkMapText(props: HkMapTextProps) {
	const roomDisplayStore = useRoomDisplayStore();
	const roomColoringStore = useRoomColoringStore();
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
			('gameObjectName' in props.visibleBy
				? roomDisplayStore.statesByGameObjectName.get(props.visibleBy.gameObjectName)!.isVisible()
				: roomDisplayStore.zoneVisible.get(props.visibleBy.zoneName)!());
		return visible ? '1' : '0';
	};

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
			{hkLangString(props.textData.sheetName as any, props.textData.convoName) ?? props.textData.convoName}
		</text>
	);
}

const roomTexts = roomData.flatMap((room) =>
	room.texts.filter((text) => !text.objectPath.includes('Next Area')).map((text) => ({ room, text })),
);

export function HkMapTexts() {
	return (
		<g data-group="area-names">
			<For each={roomTexts}>
				{(it) => (
					<HkMapText
						textData={it.text}
						visibleBy={{
							gameObjectName: it.room.gameObjectNameNeededInVisited,
						}}
					/>
				)}
			</For>
			<For each={areaNames}>
				{(text) => (
					<HkMapText
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
