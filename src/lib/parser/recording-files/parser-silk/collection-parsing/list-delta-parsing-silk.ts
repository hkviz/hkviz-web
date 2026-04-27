import { Vector2 } from '~/lib/game-data/shared/vectors';
import { StoryEventInfoSilk } from '~/lib/game-data/silk-data/types/player-data-custom-types-silk';
import { ParsingLoggerSilk } from '../parsing-log-silk';
import { SilkRecordingDataView } from '../silk-recording-data-view';
import { CollectionDiff } from './diff-types-shared';

export class ArrayAppendDelta<T> extends CollectionDiff<T[]> {
	newLength: number;
	updates: Map<number, T> = new Map();

	constructor(newLength: number) {
		super();
		this.newLength = newLength;
	}

	override combineOnto(previous: T[]): T[] {
		if (!Array.isArray(previous)) {
			throw new Error('Previous value must be an array');
		}
		const result = previous.slice(0, this.newLength);
		for (const [index, value] of this.updates) {
			if (index < 0 || index >= this.newLength) {
				throw new Error(`Index ${index} out of bounds for array of length ${this.newLength}`);
			}
			result[index] = value;
		}
		return result;
	}
}

export function parseIndexedListDelta<T>(
	reader: SilkRecordingDataView,
	readValue: () => T,
	logStep: ParsingLoggerSilk,
): ArrayAppendDelta<T> {
	logStep('parse_indexed_list_delta_start');
	const newLength = reader.readInt32();
	const changedCount = reader.readInt32();
	const delta = new ArrayAppendDelta<T>(newLength);

	for (let i = 0; i < changedCount; i++) {
		const index = reader.readInt32();
		const value = readValue();
		if (index >= newLength) {
			console.error('Index out of bounds for indexed list delta', { index, newLength });
		} else if (index >= 0) {
			delta.updates.set(index, value);
		}
	}

	logStep('parse_indexed_list_delta_complete', {
		changedCount,
		resultLength: delta.newLength,
	});

	return delta;
}

export function parseWrappedVector2ListDelta(
	reader: SilkRecordingDataView,
	logStep: ParsingLoggerSilk,
): ArrayAppendDelta<Vector2[]> {
	return parseIndexedListDelta(reader, () => reader.readWrappedVector2List(), logStep);
}

export function parseStoryEventListDelta(
	reader: SilkRecordingDataView,
	logStep: ParsingLoggerSilk,
): ArrayAppendDelta<StoryEventInfoSilk> {
	return parseIndexedListDelta(reader, () => reader.readStoryEventInfo(), logStep);
}
