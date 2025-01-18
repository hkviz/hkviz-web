import { JSXElement } from 'solid-js';
import { createRoomColoringStore, RoomColoringStoreContext } from './room-coloring-store';
import { createThemeStore, ThemeContext } from './theme-store';
import { createTourStore, TourStoreContext } from './tour-store';

export function GlobalStoresProvider(props: { children: JSXElement }) {
	const themeStore = createThemeStore();
	console.log({ themeStore });
	return <ThemeContext.Provider value={themeStore}>{props.children}</ThemeContext.Provider>;
}

export function RunStoresProvider(props: { children: JSXElement }) {
	const themeStore = createThemeStore();

	const roomColoringStore = createRoomColoringStore(themeStore);
	const tourStore = createTourStore(roomColoringStore);

	console.log({ themeStore, roomColoringStore, tourStore });

	return (
		<RoomColoringStoreContext.Provider value={roomColoringStore}>
			<TourStoreContext.Provider value={tourStore}>{props.children}</TourStoreContext.Provider>
		</RoomColoringStoreContext.Provider>
	);
}
