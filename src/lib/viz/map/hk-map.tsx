import * as d3 from 'd3';
import { Show, createEffect, onMount, type Component } from 'solid-js';
import { cn } from '~/lib/utils';
import { mapVisualExtends, roomData } from '../../parser';
import { createElementSize } from '../canvas';
import { mapZoomStore, roomDisplayStore, uiStore } from '../store';
import { HkMapRooms } from './hk-map-rooms';
import { HkMapTexts } from './hk-map-texts';
import { createHKMapZoom } from './hk-map-zoom';
import { MapLegend } from './legend';
import { MapOverlayOptions } from './map-overlay-options';
import { OutlineFilter } from './svg-filters';
import { HKMapTraces } from './traces-canvas';

export interface HKMapProps {
	class?: string;
}

export const HKMap: Component<HKMapProps> = (props: HKMapProps) => {
	const isV1 = uiStore.isV1;

	const zoom = d3
		.zoom<SVGSVGElement, unknown>()
		.scaleExtent([0.25, 10])
		.translateExtent([
			[
				mapVisualExtends.min.x - mapVisualExtends.size.x * 0.5,
				mapVisualExtends.min.y - mapVisualExtends.size.y * 0.5,
			],
			[
				mapVisualExtends.max.x + mapVisualExtends.size.x * 0.5,
				mapVisualExtends.max.y + mapVisualExtends.size.y * 0.5,
			],
		])
		.on('zoom', (event) => {
			if (event.sourceEvent) {
				mapZoomStore.setEnabled(false);
			}

			 
			rootGD3.attr('transform', event.transform);
			mapZoomStore.setTransform({
				offsetX: event.transform.x,
				offsetY: event.transform.y,
				scale: event.transform.k,
			});
		});

	const rootG = (
		<g data-group="root">
			<HkMapRooms
				rooms={roomData}
				onMouseOver={(_, r) => {
					roomDisplayStore.setSelectedRoomIfNotPinned(r.sceneName);
					roomDisplayStore.setHoveredRoom(r.sceneName);
				}}
				onMouseOut={(_, r) => {
					roomDisplayStore.unsetHoveredRoom(r.sceneName);
				}}
				onClick={(_, r) => {
					console.log('clicked room', r);
					// if (event.pointerType !== 'touch') {
					roomDisplayStore.togglePinnedRoom(r.sceneName, 'map-room-click');
					// } else {
					// setSelectedRoomPinned(false);
					// setSelectedRoomIfNotPinned(r.sceneName);
					// }
				}}
			/>
			<Show when={!isV1()}>
				<HkMapTexts />
			</Show>
		</g>
	) as SVGGElement;
	const rootGD3 = d3.select(rootG);

	const svg = (
		<svg
			class="absolute inset-0"
			width={1000}
			height={1000}
			viewBox={mapVisualExtends.toD3ViewBox().toString()}
			preserveAspectRatio="xMidYMid meet"
		>
			<defs>
				<OutlineFilter />
			</defs>
			{rootG}
		</svg>
	) as SVGSVGElement;

	const svgD3 = d3.select(svg);
	onMount(() => {
		svgD3.call(zoom);
	});

	const container = (
		<div class={cn('hk-main-map-wrapper relative', props.class)}>
			{svg}
			<HKMapTraces />
			<div class="absolute right-2 top-2 lg:top-10 xl:top-2">
				<MapLegend />
			</div>
			<Show when={!isV1()}>
				<div class="absolute bottom-2 right-2">
					<MapOverlayOptions />
				</div>
			</Show>
		</div>
	) as HTMLDivElement;

	const containerSize = createElementSize(() => container);
	createEffect(() => {
		const _containerSize = containerSize();
		if (!_containerSize) return;

		svgD3.attr('width', _containerSize.width).attr('height', _containerSize.height);
	});

	createHKMapZoom({
		zoom,
		svg: svgD3,
	});

	// TODO don render on server
	// console.log('hkmap', container);
	return container;
};
