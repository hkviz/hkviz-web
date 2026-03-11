import { createEffect, JSXElement, onCleanup } from 'solid-js';
import { createSpriteSheetStore, SpriteStoreContext } from '../spritesheets/spritesheet-store';
import { AggregationStoreContext, createAggregationStore } from './aggregation-store';
import { AnimationStoreContext, createAnimationStore } from './animation-store';
import { AnimationTickStoreContext, createAnimationTickStore } from './animation-tick-store';
import { createExtraChartStore, ExtraChartStoreContext } from './extra-chart-store';
import { createGameplayStore, GameplayStoreContext } from './gameplay-store';
import { createHoverMsStore, HoverMsStoreContext } from './hover-ms-store';
import { createLayoutStore, LayoutStoreContext } from './layout-store';
import { createMapZoomStore, MapZoomStoreContext } from './map-zoom-store';
import { createPlayerDataAnimationStore, PlayerDataAnimationStoreContext } from './player-data-animation-store';
import { createRoomColoringStore, RoomColoringStoreContext } from './room-coloring-store';
import { createRoomDisplayStore, RoomDisplayStoreContext } from './room-display-store';
import { createSplitsStore, SplitsStoreContext } from './splits-store';
import { createThemeStore, ThemeStoreContext, useThemeStore } from './theme-store';
import { createTourStore, TourStoreContext } from './tour-store';
import { createTraceStore, TraceStoreContext } from './trace-store';
import { createUiStore, UiStoreContext, useUiStore } from './ui-store';
import { createViewportStore, ViewportStoreContext } from './viewport-store';

export function GlobalStoresProvider(props: { children: JSXElement }) {
	const themeStore = createThemeStore();
	const uiStore = createUiStore();
	const spriteSheetStore = createSpriteSheetStore();

	return (
		<SpriteStoreContext.Provider value={spriteSheetStore}>
			<UiStoreContext.Provider value={uiStore}>
				<ThemeStoreContext.Provider value={themeStore}>{props.children}</ThemeStoreContext.Provider>
			</UiStoreContext.Provider>
		</SpriteStoreContext.Provider>
	);
}

export function RunStoresProvider(props: { children: JSXElement }) {
	const themeStore = useThemeStore();
	const uiStore = useUiStore();

	const layoutStore = createLayoutStore();
	const gameplayStore = createGameplayStore();
	const hoverMsStore = createHoverMsStore(gameplayStore);
	const animationStore = createAnimationStore(gameplayStore, uiStore);
	const mapZoomStore = createMapZoomStore();
	const viewportStore = createViewportStore();
	const traceStore = createTraceStore(animationStore);
	const extraChartStore = createExtraChartStore(animationStore, gameplayStore);
	const playerDataAnimationStore = createPlayerDataAnimationStore(animationStore, gameplayStore);
	const roomDisplayStore = createRoomDisplayStore(playerDataAnimationStore, gameplayStore);
	const aggregationStore = createAggregationStore(roomDisplayStore, animationStore, gameplayStore);
	const roomColoringStore = createRoomColoringStore(themeStore, aggregationStore, animationStore);
	const splitsStore = createSplitsStore(gameplayStore, animationStore);
	const tourStore = createTourStore(
		roomColoringStore,
		roomDisplayStore,
		viewportStore,
		animationStore,
		uiStore,
		mapZoomStore,
	);
	const animationTickStore = createAnimationTickStore(animationStore, extraChartStore);

	createEffect(() => {
		const allStores = {
			gameplayStore,
			hoverMsStore,
			animationStore,
			mapZoomStore,
			traceStore,
			extraChartStore,
			playerDataAnimationStore,
			roomDisplayStore,
			aggregationStore,
			roomColoringStore,
			splitsStore,
			tourStore,
			viewportStore,
			animationTickStore,
		};

		(window as any).stores = allStores;

		onCleanup(() => {
			if ((window as any).stores === allStores) {
				(window as any).stores = null;
			}
		});
	});

	return (
		<LayoutStoreContext.Provider value={layoutStore}>
			<SplitsStoreContext.Provider value={splitsStore}>
				<GameplayStoreContext.Provider value={gameplayStore}>
					<HoverMsStoreContext.Provider value={hoverMsStore}>
						<MapZoomStoreContext.Provider value={mapZoomStore}>
							<TraceStoreContext.Provider value={traceStore}>
								<ExtraChartStoreContext.Provider value={extraChartStore}>
									<AnimationStoreContext.Provider value={animationStore}>
										<ViewportStoreContext.Provider value={viewportStore}>
											<PlayerDataAnimationStoreContext.Provider value={playerDataAnimationStore}>
												<RoomDisplayStoreContext.Provider value={roomDisplayStore}>
													<RoomColoringStoreContext.Provider value={roomColoringStore}>
														<AggregationStoreContext.Provider value={aggregationStore}>
															<TourStoreContext.Provider value={tourStore}>
																<AnimationTickStoreContext.Provider
																	value={animationTickStore}
																>
																	{props.children}
																</AnimationTickStoreContext.Provider>
															</TourStoreContext.Provider>
														</AggregationStoreContext.Provider>
													</RoomColoringStoreContext.Provider>
												</RoomDisplayStoreContext.Provider>
											</PlayerDataAnimationStoreContext.Provider>
										</ViewportStoreContext.Provider>
									</AnimationStoreContext.Provider>
								</ExtraChartStoreContext.Provider>
							</TraceStoreContext.Provider>
						</MapZoomStoreContext.Provider>
					</HoverMsStoreContext.Provider>
				</GameplayStoreContext.Provider>
			</SplitsStoreContext.Provider>
		</LayoutStoreContext.Provider>
	);
}
