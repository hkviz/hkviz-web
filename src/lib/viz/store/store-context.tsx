import { createEffect, JSXElement, onCleanup } from 'solid-js';
import { AggregationStoreContext, createAggregationStore } from './aggregation-store';
import { AnimationStoreContext, createAnimationStore } from './animation-store';
import { createExtraChartStore, ExtraChartStoreContext } from './extra-chart-store';
import { createPlayerDataAnimationStore, PlayerDataAnimationStoreContext } from './player-data-animation-store';
import { createRoomColoringStore, RoomColoringStoreContext } from './room-coloring-store';
import { createRoomDisplayStore, RoomDisplayStoreContext } from './room-display-store';
import { createThemeStore, ThemeStoreContext, useThemeStore } from './theme-store';
import { createTourStore, TourStoreContext } from './tour-store';
import { createViewportStore, ViewportStoreContext } from './viewport-store';
import { createUiStore, UiStoreContext, useUiStore } from './ui-store';
import { createTraceStore, TraceStoreContext } from './trace-store';
import { createMapZoomStore, MapZoomStoreContext } from './map-zoom-store';
import { createHoverMsStore, HoverMsStoreContext } from './hover-ms-store';
import { createGameplayStore, GameplayStoreContext } from './gameplay-store';
import { createSplitsStore, SplitsStoreContext } from './splits-store';

export function GlobalStoresProvider(props: { children: JSXElement }) {
	const themeStore = createThemeStore();
	const uiStore = createUiStore();

	return (
		<UiStoreContext.Provider value={uiStore}>
			<ThemeStoreContext.Provider value={themeStore}>{props.children}</ThemeStoreContext.Provider>
		</UiStoreContext.Provider>
	);
}

export function RunStoresProvider(props: { children: JSXElement }) {
	const themeStore = useThemeStore();
	const uiStore = useUiStore();

	const gameplayStore = createGameplayStore();
	const hoverMsStore = createHoverMsStore();
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
		};

		(window as any).stores = allStores;

		onCleanup(() => {
			if ((window as any).stores === allStores) {
				(window as any).stores = null;
			}
		});
	});

	return (
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
															{props.children}
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
	);
}
