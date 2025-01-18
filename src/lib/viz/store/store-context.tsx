import { JSXElement } from 'solid-js';
import { AggregationStoreContext, createAggregationStore } from './aggregation-store';
import { createPlayerDataAnimationStore, PlayerDataAnimationStoreContext } from './player-data-animation-store';
import { createRoomColoringStore, RoomColoringStoreContext } from './room-coloring-store';
import { createRoomDisplayStore, RoomDisplayStoreContext } from './room-display-store';
import { createThemeStore, ThemeStoreContext } from './theme-store';
import { createTourStore, TourStoreContext } from './tour-store';
import { createViewportStore, ViewportStoreContext } from './viewport-store';

export function GlobalStoresProvider(props: { children: JSXElement }) {
	const themeStore = createThemeStore();

	return <ThemeStoreContext.Provider value={themeStore}>{props.children}</ThemeStoreContext.Provider>;
}

export function RunStoresProvider(props: { children: JSXElement }) {
	const themeStore = createThemeStore();

	const viewportStore = createViewportStore();
	const playerDataAnimationStore = createPlayerDataAnimationStore();
	const roomDisplayStore = createRoomDisplayStore(playerDataAnimationStore);
	const aggregationStore = createAggregationStore(roomDisplayStore);
	const roomColoringStore = createRoomColoringStore(themeStore, aggregationStore);
	const tourStore = createTourStore(roomColoringStore, roomDisplayStore, viewportStore);

	return (
		<ViewportStoreContext.Provider value={viewportStore}>
			<PlayerDataAnimationStoreContext.Provider value={playerDataAnimationStore}>
				<RoomDisplayStoreContext.Provider value={roomDisplayStore}>
					<RoomColoringStoreContext.Provider value={roomColoringStore}>
						<AggregationStoreContext.Provider value={aggregationStore}>
							<TourStoreContext.Provider value={tourStore}>{props.children}</TourStoreContext.Provider>
						</AggregationStoreContext.Provider>
					</RoomColoringStoreContext.Provider>
				</RoomDisplayStoreContext.Provider>
			</PlayerDataAnimationStoreContext.Provider>
		</ViewportStoreContext.Provider>
	);
}
