import { JSX } from 'solid-js';
import { RoomHoverSource, useAnimationStore, useHoverMsStore, useRoomDisplayStore } from '../store';

export function createRoomMsButtonProps(props: {
	room?: () =>
		| { sceneName: string | undefined | null; hoverSource: RoomHoverSource; selectIfNotPinned: boolean }
		| undefined
		| null;
	time?: () => { msIntoGame: number | undefined | null } | undefined | null;
	withClick?: boolean;
	onClick?: () => void;
}): JSX.HTMLAttributes<HTMLButtonElement> {
	const hoverMsStore = useHoverMsStore();
	const roomDisplayStore = useRoomDisplayStore();
	const animationStore = useAnimationStore();

	function handleMouseEnter() {
		const room = props.room?.();
		const time = props.time?.();
		if (room?.sceneName !== undefined && room.sceneName !== null) {
			roomDisplayStore.setHoveredRoom(room.sceneName, room.hoverSource);
			if (room.selectIfNotPinned) {
				roomDisplayStore.setSelectedRoomIfNotPinned(room.sceneName);
			}
		}
		if (time?.msIntoGame !== undefined && time.msIntoGame !== null) {
			hoverMsStore.setHoveredMsIntoGame(time.msIntoGame);
		}
	}

	function handleMouseLeave() {
		const room = props.room?.();
		const time = props.time?.();
		if (room?.sceneName !== undefined && room.sceneName !== null) {
			roomDisplayStore.unsetHoveredRoom(room.sceneName);
		}
		if (time?.msIntoGame !== undefined && time.msIntoGame !== null) {
			hoverMsStore.unsetHoveredMsIntoGame(time.msIntoGame);
		}
	}

	const attributes: JSX.HTMLAttributes<HTMLButtonElement> = {
		onMouseEnter: handleMouseEnter,
		onMouseLeave: handleMouseLeave,
	};

	// eslint-disable-next-line solid/reactivity
	if (props.withClick) {
		// eslint-disable-next-line solid/reactivity
		attributes.onClick = () => {
			const room = props.room?.();
			const time = props.time?.();
			if (room?.sceneName !== undefined && room.sceneName !== null) {
				roomDisplayStore.setSelectedSceneName(room.sceneName);
			}
			if (time?.msIntoGame !== undefined && time.msIntoGame !== null) {
				animationStore.setMsIntoGame(time.msIntoGame, 'smooth');
			}
			props.onClick?.();
		};
	}
	return attributes;
}
