import { Vector2 } from '~/lib/game-data/shared/vectors';
import { PlayerDataFieldTypeSilk } from '~/lib/game-data/silk-data/player-data-silk.generated';
import {
	CollectableItemsDataSilk,
	CollectableMementosDataSilk,
	CollectableRelicsDataSilk,
	EnemyJournalKillDataSilk,
	MateriumItemsDataSilk,
	QuestCompletionDataSilk,
	QuestRumourDataSilk,
	StoryEventInfoSilk,
	ToolCrestsDataSilk,
	ToolItemLiquidsDataSilk,
	ToolItemsDataSilk,
} from '~/lib/game-data/silk-data/types/player-data-custom-types-silk';
import { SilkRecordingDataView } from './silk-recording-data-view';

const logDeltaStep = (step: string, details?: unknown): void => {
	if (details == null) {
		// console.log(`[silk-parser:delta] ${step}`);
		return;
	}
	// console.log(`[silk-parser:delta] ${step}`, details);
};

export type NamedMapValueSilk =
	| boolean
	| number
	| CollectableItemsDataSilk
	| CollectableRelicsDataSilk
	| CollectableMementosDataSilk
	| QuestRumourDataSilk
	| QuestCompletionDataSilk
	| MateriumItemsDataSilk
	| ToolItemLiquidsDataSilk
	| ToolItemsDataSilk
	| ToolCrestsDataSilk
	| EnemyJournalKillDataSilk;

export function parseIndexedListDelta<T>(
	reader: SilkRecordingDataView,
	listLength: number,
	previousValue: readonly T[] | null,
	readValue: () => T,
	copyValue: (value: T) => T = (value) => value,
): T[] {
	logDeltaStep('parse_indexed_list_delta_start', {
		listLength,
		previousLength: previousValue?.length ?? 0,
	});
	const changedCount = reader.readInt32();
	const values: T[] = previousValue?.slice(0, listLength).map((value) => copyValue(value)) ?? [];

	while (values.length < listLength) {
		values.push(readValue());
	}

	for (let i = 0; i < changedCount; i++) {
		const index = reader.readInt32();
		const value = readValue();
		if (index >= 0 && index < listLength) {
			values[index] = value;
		}
	}

	logDeltaStep('parse_indexed_list_delta_complete', {
		changedCount,
		resultLength: values.length,
	});

	return values;
}

export function parseAppendedList<T>(
	reader: SilkRecordingDataView,
	oldLength: number,
	previousValue: readonly T[] | null,
	readItemList: () => T,
	copyValue: (value: T) => T = (value) => value,
): T[] {
	logDeltaStep('parse_appended_list_start', {
		oldLength,
		previousLength: previousValue?.length ?? 0,
	});
	const appendCount = reader.readInt32();
	const values: T[] = previousValue?.slice(0, oldLength).map((value) => copyValue(value)) ?? [];

	while (values.length < oldLength) {
		values.push(readItemList());
	}

	for (let i = 0; i < appendCount; i++) {
		values.push(readItemList());
	}

	logDeltaStep('parse_appended_list_complete', {
		appendCount,
		resultLength: values.length,
	});

	return values;
}

export function parseStringSetDelta(
	reader: SilkRecordingDataView,
	previousValue: ReadonlySet<string> | null,
): Set<string> {
	logDeltaStep('parse_string_set_delta_start', {
		previousSize: previousValue?.size ?? 0,
	});
	const values = new Set<string>(previousValue ?? []);
	const addedCount = reader.readInt32();
	for (let i = 0; i < addedCount; i++) {
		values.add(reader.readString());
	}
	const removedCount = reader.readInt32();
	for (let i = 0; i < removedCount; i++) {
		values.delete(reader.readString());
	}
	logDeltaStep('parse_string_set_delta_complete', {
		addedCount,
		removedCount,
		resultSize: values.size,
	});
	return values;
}

export function parseStoryEventListDelta(
	reader: SilkRecordingDataView,
	listLength: number,
	previousValue: readonly StoryEventInfoSilk[] | null,
): StoryEventInfoSilk[] {
	return parseIndexedListDelta(reader, listLength, previousValue, () => reader.readStoryEventInfo());
}

function cloneVector2List(entry: readonly Vector2[]): Vector2[] {
	return [...entry];
}

export function parseWrappedVector2ListDelta(
	reader: SilkRecordingDataView,
	listLength: number,
	previousValue: readonly Vector2[][] | null,
): Vector2[][] {
	return parseIndexedListDelta(
		reader,
		listLength,
		previousValue,
		() => reader.readWrappedVector2List(),
		cloneVector2List,
	);
}

export function parseWrappedVector2ListAppend(
	reader: SilkRecordingDataView,
	oldLength: number,
	previousValue: readonly Vector2[][] | null,
): Vector2[][] {
	return parseAppendedList(reader, oldLength, previousValue, () => reader.readWrappedVector2List(), cloneVector2List);
}

export function readNamedMapValue(
	reader: SilkRecordingDataView,
	fieldType: PlayerDataFieldTypeSilk,
): NamedMapValueSilk {
	switch (fieldType) {
		case 'dictionary<string,bool>':
			return reader.readBool();
		case 'dictionary<string,int>':
			return reader.readInt32();
		case 'CollectableItemsData':
			return reader.readCollectableItemsData();
		case 'CollectableRelicsData':
			return reader.readCollectableRelicsData();
		case 'CollectableMementosData':
			return reader.readCollectableMementosData();
		case 'QuestRumourData':
			return reader.readQuestRumourData();
		case 'QuestCompletionData':
			return reader.readQuestCompletionData();
		case 'MateriumItemsData':
			return reader.readMateriumItemsData();
		case 'ToolItemLiquidsData':
			return reader.readToolItemLiquidsData();
		case 'ToolItemsData':
			return reader.readToolItemsData();
		case 'ToolCrestsData':
			return reader.readToolCrestsData();
		case 'EnemyJournalKillData':
			return reader.readEnemyJournalKillData();
		default:
			throw new Error(`Unsupported named map field type ${fieldType}`);
	}
}

export function parseNamedMapFull(
	reader: SilkRecordingDataView,
	fieldType: PlayerDataFieldTypeSilk,
): Map<string, NamedMapValueSilk> {
	logDeltaStep('parse_named_map_full_start', { fieldType });
	const count = reader.readInt32();
	if (count < 0) {
		throw new Error(`Invalid named map count ${count} at ${reader.offset - 4}`);
	}
	console.log('Parsing full named map with count', count, 'and field type', fieldType);

	const values = new Map<string, NamedMapValueSilk>();
	for (let i = 0; i < count; i++) {
		const key = reader.readString();
		const value = readNamedMapValue(reader, fieldType);
		values.set(key, value);
		console.log(`Parsed named map entry ${i + 1}/${count} with key ${key} and value`, value);
	}

	logDeltaStep('parse_named_map_full_complete', {
		fieldType,
		count,
		resultSize: values.size,
	});

	return values;
}

export function parseNamedMapDelta(
	reader: SilkRecordingDataView,
	fieldType: PlayerDataFieldTypeSilk,
	previousValue: ReadonlyMap<string, NamedMapValueSilk> | null,
): Map<string, NamedMapValueSilk> {
	logDeltaStep('parse_named_map_delta_start', {
		fieldType,
		previousSize: previousValue?.size ?? 0,
	});
	const values = previousValue
		? new Map<string, NamedMapValueSilk>(previousValue)
		: new Map<string, NamedMapValueSilk>();

	const upsertsCount = reader.readInt32();
	for (let i = 0; i < upsertsCount; i++) {
		const key = reader.readString();
		const value = readNamedMapValue(reader, fieldType);
		values.set(key, value);
	}

	const removedCount = reader.readInt32();
	for (let i = 0; i < removedCount; i++) {
		values.delete(reader.readString());
	}

	logDeltaStep('parse_named_map_delta_complete', {
		fieldType,
		upsertsCount,
		removedCount,
		resultSize: values.size,
	});

	return values;
}
