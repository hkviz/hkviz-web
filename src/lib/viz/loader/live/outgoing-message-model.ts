export interface ViewerAppendDataMessage {
	type: 'viewer:append';
	filePartNr: number;
	data: string[];
}

export type ViewerMessage = ViewerAppendDataMessage;
