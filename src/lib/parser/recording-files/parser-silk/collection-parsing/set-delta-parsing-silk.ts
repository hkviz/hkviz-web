import { ParsingLoggerSilk } from '../parsing-log-silk';
import { SilkRecordingDataView } from '../silk-recording-data-view';
import { CollectionDiff } from './diff-types-shared';

export class StringSetDelta extends CollectionDiff<Set<string>> {
	added: string[] = [];
	removed: string[] = [];

	override combineOnto(previous: Set<string>): Set<string> {
		if (!(previous instanceof Set)) {
			throw new Error('Previous value must be a Set<string>');
		}
		const result = new Set<string>(previous);
		for (const value of this.added) {
			result.add(value);
		}
		for (const value of this.removed) {
			result.delete(value);
		}
		return result;
	}
}

export function parseStringSetDelta(
	reader: SilkRecordingDataView,
	idToString: Map<number, string>,
	logStep: ParsingLoggerSilk,
): StringSetDelta {
	logStep('parse_string_set_delta_start');
	const delta = new StringSetDelta();
	const addedCount = reader.readInt32();
	for (let i = 0; i < addedCount; i++) {
		delta.added.push(reader.readStringWithId(idToString) ?? '');
	}
	const removedCount = reader.readInt32();
	for (let i = 0; i < removedCount; i++) {
		delta.removed.push(reader.readStringWithId(idToString) ?? '');
	}
	logStep('parse_string_set_delta_complete', {
		addedCount,
		removedCount,
	});
	return delta;
}
