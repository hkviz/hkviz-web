import * as d3 from 'd3';

export type ColorMapId = 'viridis-cool' | 'plasma-inferno' | 'red';

export interface RoomColorMap {
	id: ColorMapId;
	nameLight: string;
	nameDark: string;
	getColorLight: (value: number) => string;
	getColorDark: (value: number) => string;
}

const colorMapViridisCool: RoomColorMap = {
	id: 'viridis-cool',
	nameLight: 'Cool',
	getColorLight(value: number) {
		// const colorMapColor = d3.hsl(d3.color(d3.interpolateViridis(value))!);
		// return colorMapColor.copy({ s: colorMapColor.s * 1.35, l: colorMapColor.l * 0.7 }).formatHex();
		const colorMapColor = d3.hsl(d3.interpolateCool(value));
		return colorMapColor.copy({ s: colorMapColor.s * 1.35, l: colorMapColor.l ** 0.7 * 0.75 }).formatHex();
	},
	nameDark: 'Viridis',
	getColorDark(value: number) {
		const colorMapColor = d3.color(d3.interpolateViridis(value))!;
		return colorMapColor.formatHex();
	},
};

const colorMapPlasma: RoomColorMap = {
	id: 'plasma-inferno',
	nameDark: 'Plasma',
	getColorDark(value: number) {
		const colorMapColor = d3.color(d3.interpolatePlasma(value))!;
		return colorMapColor.formatHex();
	},
	nameLight: 'Inferno',
	getColorLight(value: number) {
		// starts of at near black -> nice for light mode --> bad for dark mode
		const colorMapColor = d3.hsl(d3.color(d3.interpolateInferno(value * 0.9))!);
		return colorMapColor.copy({ s: colorMapColor.s * 1.1, l: colorMapColor.l * 0.9 }).formatHex();
	},
};

const colorMapRed: RoomColorMap = {
	id: 'red',
	nameLight: 'Red',
	nameDark: 'Red',
	getColorDark(value: number) {
		const colorMapColor = d3.color(d3.interpolatePuRd(1 - value))!;
		return colorMapColor.formatHex();
	},
	getColorLight(value: number) {
		const colorMapColor = d3.hsl(d3.color(d3.interpolatePuRd(value))!);
		return colorMapColor.copy({ s: colorMapColor.s * 1.1, l: 1 - colorMapColor.l }).formatHex();
	},
};

export const roomColorMaps: RoomColorMap[] = [colorMapViridisCool, colorMapPlasma, colorMapRed];

export const roomColorMapById = new Map(roomColorMaps.map((colorMap) => [colorMap.id, colorMap] as const));

export function getRoomColorMapById(id: ColorMapId): RoomColorMap {
	const colorMap = roomColorMapById.get(id);
	if (!colorMap) {
		throw new Error(`Unknown color map id: ${id}`);
	}
	return colorMap;
}
