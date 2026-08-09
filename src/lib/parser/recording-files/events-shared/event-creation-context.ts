export interface RestorePointInfo {
	number: number;
	date: string;
}

export class EventCreationContext {
	public msIntoGame: number | null = null;
	public timestamp = 0;
	public restorePoint: RestorePointInfo | null = null;
}
