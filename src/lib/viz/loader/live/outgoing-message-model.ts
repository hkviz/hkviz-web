export interface ViewerAppendDataMessage {
	type: 'viewer:append';
	filePartNr: number;
	data: string[];
}

export interface ViewerHostStateMessage {
	type: 'viewer:host-state';
	connected: boolean;
}

export type ViewerMessage = ViewerAppendDataMessage | ViewerHostStateMessage;
