import { createEffect, onCleanup } from 'solid-js';

export function createRunLiveLoader() {
	// TODO take url and access token as argument

	createEffect(() => {
		const ws = new WebSocket('ws://127.0.0.1:8787/websocket?mode=view&accessKey=abc');
		ws.onopen = () => {
			console.log('connected');
		};
		ws.onmessage = (event) => {
			console.log('received', event.data);
		};

		onCleanup(() => {
			ws.close();
		});
	});
}
