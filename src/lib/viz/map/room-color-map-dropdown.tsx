import { type Component, For, createMemo } from 'solid-js';
import {
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from '~/components/ui/dropdown-menu';
import { type RoomColorCurve, roomColorCurveById, roomColorCurves } from '../color-curves';
import { type RoomColorMap, roomColorMaps } from '../color-map';
import { useRoomColoringStore } from '../store/room-coloring-store';
import { useThemeStore } from '../store/theme-store';

const PREVIEW_HEIGHT = 14;
const PREVIEW_WIDTH = PREVIEW_HEIGHT * 2.5;
const PREVIEW_POINT_COUNT = 24;

const CurvePreview: Component<{ curve: RoomColorCurve; max: number }> = (props) => {
	const points = createMemo(() => {
		const curve = props.curve;
		const max = props.max;
		const linePoints: string[] = [];
		for (let index = 0; index <= PREVIEW_POINT_COUNT; index += 1) {
			const ratio = index / PREVIEW_POINT_COUNT;
			const value = ratio * max;
			const x = ratio * PREVIEW_WIDTH;
			const y = (1 - curve.transformTo01(value, max)) * PREVIEW_HEIGHT;
			linePoints.push(`${x},${y}`);
		}
		return linePoints.join(' ');
	});

	return (
		<svg
			class="h-6 w-15 rounded-xs text-foreground/85"
			width={PREVIEW_WIDTH}
			height={PREVIEW_HEIGHT}
			viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
			aria-hidden="true"
		>
			<rect x="0" y="0" width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} rx="2" class="fill-muted/80" />
			<polyline points={points()} fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
		</svg>
	);
};

const ColorMapPreview: Component<{
	colorMap: RoomColorMap;
	mode: 'light' | 'dark';
}> = (props) => {
	const colorFor = (value01: number) =>
		props.mode === 'light' ? props.colorMap.getColorLight(value01) : props.colorMap.getColorDark(value01);

	return (
		<svg
			class="h-6 w-15 rounded-xs"
			width={PREVIEW_WIDTH}
			height={PREVIEW_HEIGHT}
			viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
			aria-hidden="true"
		>
			<For each={Array.from({ length: PREVIEW_WIDTH }, (_, index) => index)}>
				{(x) => <rect x={x} y={0} width="1" height={PREVIEW_HEIGHT} fill={colorFor(x / (PREVIEW_WIDTH - 1))} />}
			</For>
		</svg>
	);
};

export const RoomColorMapDropdown: Component = () => {
	const roomColoringStore = useRoomColoringStore();
	const themeStore = useThemeStore();
	const var1Max = roomColoringStore.var1Max;

	return (
		<DropdownMenuContent>
			<DropdownMenuGroup>
				<DropdownMenuGroupLabel>Scale Curve</DropdownMenuGroupLabel>
				<DropdownMenuRadioGroup
					value={roomColoringStore.var1Curve().id}
					onChange={(id) => {
						roomColoringStore.setRoomColorVar1Curve(roomColorCurveById.get(id)!);
					}}
				>
					<For each={roomColorCurves}>
						{(curve) => (
							<DropdownMenuRadioItem value={curve.id}>
								<div class="flex grow items-center justify-between gap-2">
									<span>{curve.name}</span>
									<CurvePreview curve={curve} max={var1Max()} />
								</div>
							</DropdownMenuRadioItem>
						)}
					</For>
				</DropdownMenuRadioGroup>
			</DropdownMenuGroup>
			<DropdownMenuGroup>
				<DropdownMenuGroupLabel>Color Map</DropdownMenuGroupLabel>
				<DropdownMenuRadioGroup
					value={roomColoringStore.singleVarColorMapId()}
					onChange={(id) => {
						roomColoringStore.setSingleVarColorMapId(id);
					}}
				>
					<For each={roomColorMaps}>
						{(colorMap) => (
							<DropdownMenuRadioItem value={colorMap.id}>
								<div class="flex grow items-center justify-between gap-2">
									<span>
										{themeStore.currentTheme() === 'light' ? colorMap.nameLight : colorMap.nameDark}
									</span>
									<ColorMapPreview colorMap={colorMap} mode={themeStore.currentTheme()} />
								</div>
							</DropdownMenuRadioItem>
						)}
					</For>
				</DropdownMenuRadioGroup>
			</DropdownMenuGroup>
		</DropdownMenuContent>
	);
};
