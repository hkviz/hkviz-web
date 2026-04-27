import { ParsingLoggerSilk } from '../parsing-log-silk';
import { SilkRecordingDataView } from '../silk-recording-data-view';
import { CollectionDiff } from './diff-types-shared';

export class ArrayAppendDelta<T> extends CollectionDiff<T[]> {
	oldLength: number;
	added: T[] = [];

	constructor(oldLength: number) {
		super();
		this.oldLength = oldLength;
	}

	override combineOnto(previous: T[]): T[] {
		if (!Array.isArray(previous)) {
			throw new Error('Previous value must be an array');
		}
		return [...previous.slice(0, this.oldLength), ...this.added];
	}
}

export function parseAppendedList<T>(
	reader: SilkRecordingDataView,
	readItemList: () => T,
	logStep: ParsingLoggerSilk,
): ArrayAppendDelta<T> {
	logStep('parse_appended_list_start');
	const oldLength = reader.readInt32();
	const appendCount = reader.readInt32();
	const delta = new ArrayAppendDelta<T>(oldLength);

	while (delta.added.length < appendCount) {
		delta.added.push(readItemList());
	}

	logStep('parse_appended_list_complete', {
		appendCount,
		resultLength: delta.added.length,
	});

	return delta;
}
