import { onCleanup, onMount } from 'solid-js';
import { effect } from 'solid-js/web';
import {
	CombinedRecording,
	combineRecordingsAppend,
	ParsedRecording,
	parseRecordingFile,
	ParseRecordingFileContext,
} from '~/lib/parser';
import { ViewerMessage } from './outgoing-message-model';
import { CLOSE_CODE_HOST_LEFT } from './websocker-close-codes';
import { showToast } from '~/components/ui/toast';

export function createRunLiveLoader(combinedRecording: () => CombinedRecording | null) {
	// TODO take url and access token as argument

	onMount(() => {
		const ws = new WebSocket('ws://127.0.0.1:8787/websocket?mode=view&accessKey=abc');

		let currentParsingContext!: ParseRecordingFileContext;
		let currentRecordingFile!: ParsedRecording;

		let combinedRecordingReady = false;
		let queue = [] as ViewerMessage[];

		let wasConnectedPreviously = false;

		function processMessage(message: ViewerMessage) {
			const recording = combinedRecording()!;
			if (message.type === 'viewer:append') {
				const isNewPart =
					currentParsingContext == null || message.filePartNr !== currentRecordingFile?.combinedPartNumber;

				if (isNewPart) {
					currentParsingContext = new ParseRecordingFileContext();
				}

				const events = parseRecordingFile(message.data.join('\n'), message.filePartNr, currentParsingContext);

				if (isNewPart) {
					currentRecordingFile = new ParsedRecording(
						events,
						currentParsingContext.unknownEvents,
						currentParsingContext.parsingErrors,
						message.filePartNr,
						true,
					);
				} else {
					currentRecordingFile.append(events, currentParsingContext);
				}
				combineRecordingsAppend(recording, events);
			} else if (message.type === 'viewer:host-state') {
				recording.isHostConnected = message.connected;
				if (message.connected) {
					recording.isLive = true;
					wasConnectedPreviously = true;
				}
			}
			console.log('received', message);
		}

		effect(() => {
			if (combinedRecordingReady) return;
			if (combinedRecording()) {
				combinedRecordingReady = true;
				queue.forEach((message) => processMessage(message));
				queue = [];
			}
		});

		ws.onopen = () => {
			console.log('connected');
		};
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data) as ViewerMessage;
			if (combinedRecordingReady) {
				processMessage(message);
			} else {
				queue.push(message);
			}
		};

		ws.onclose = (event) => {
			if (event.code === CLOSE_CODE_HOST_LEFT) {
				const recording = combinedRecording();
				if (recording) {
					recording.isLive = false;
					recording.freeze();
					if (wasConnectedPreviously) {
						showToast({
							title: 'Player disconnected',
							description:
								"Your connection has been terminated and won't automatically reconnect when the player returns. Reload the page if you believe the player is back.",
							variant: 'destructive',
						});
					}
				}
			}
		};

		onCleanup(() => {
			ws.close();
		});
	});
}
