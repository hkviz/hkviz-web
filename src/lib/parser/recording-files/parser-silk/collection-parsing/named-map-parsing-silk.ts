import { PlayerDataFieldTypeNamedMapSilk } from '~/lib/game-data/silk-data/player-data-silk';
import { PlayerDataFieldSilk, PlayerDataFieldTypeSilk } from '~/lib/game-data/silk-data/player-data-silk.generated';
import {
	CollectableItemsDataSilk,
	CollectableMementosDataSilk,
	CollectableRelicsDataSilk,
	EnemyJournalKillDataSilk,
	MateriumItemsDataSilk,
	QuestCompletionDataSilk,
	QuestRumourDataSilk,
	ToolCrestsDataSilk,
	ToolCrestsSlotDataSilk,
	ToolItemLiquidsDataSilk,
	ToolItemsDataSilk,
} from '~/lib/game-data/silk-data/types/player-data-custom-types-silk';
import { typeCheckNever } from '~/lib/util';
import { ParsingLoggerSilk } from '../parsing-log-silk';
import { SilkRecordingDataView } from '../silk-recording-data-view';
import { getStringIdToStringForField } from '../string-id-by-field-silk';
import { CollectionDiff } from './diff-types-shared';

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
	| EnemyJournalKillDataSilk
	| ToolCrestsSlotDataSilk;

export function readNamedMapValue(
	reader: SilkRecordingDataView,
	fieldType: PlayerDataFieldTypeSilk,
): NamedMapValueSilk {
	const fieldTypeAsNamedMap = fieldType as PlayerDataFieldTypeNamedMapSilk;
	switch (fieldTypeAsNamedMap) {
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
		case 'FloatingCrestSlotsData':
			return reader.readToolCrestsSlotData();
		default:
			typeCheckNever(fieldTypeAsNamedMap);
			throw new Error(`Unsupported named map field type ${fieldType}`);
	}
}

export function parseNamedMapFull(
	reader: SilkRecordingDataView,
	field: PlayerDataFieldSilk,
	fieldType: PlayerDataFieldTypeSilk,
	logStep: ParsingLoggerSilk,
): Map<string, NamedMapValueSilk> {
	logStep('parse_named_map_full_start', { fieldType });
	const count = reader.readInt32();
	if (count < 0) {
		throw new Error(`Invalid named map count ${count} at ${reader.offset - 4}`);
	}
	// console.log('Parsing full named map with count', count, 'and field type', fieldType);

	const values = new Map<string, NamedMapValueSilk>();
	for (let i = 0; i < count; i++) {
		const key = reader.readStringWithId(getStringIdToStringForField(field)) ?? '';
		const value = readNamedMapValue(reader, fieldType);
		values.set(key, value);
		// console.log(`Parsed named map entry ${i + 1}/${count} with key ${key} and value`, value);
	}

	logStep('parse_named_map_full_complete', {
		fieldType,
		count,
		resultSize: values.size,
	});

	return values;
}

export class NamedMapDelta<T> extends CollectionDiff<Map<string, T>> {
	newLength: number;
	updates: Map<string, T> = new Map();
	removals: Set<string> = new Set();

	constructor(newLength: number) {
		super();
		this.newLength = newLength;
	}

	override combineOnto(previous: Map<string, T>): Map<string, T> {
		if (!(previous instanceof Map)) {
			throw new Error('Previous value must be a map');
		}
		const result = new Map(previous);
		for (const [key, value] of this.updates) {
			result.set(key, value);
		}
		for (const key of this.removals) {
			result.delete(key);
		}
		return result;
	}
}

export function parseNamedMapDelta(
	reader: SilkRecordingDataView,
	field: PlayerDataFieldSilk,
	fieldType: PlayerDataFieldTypeSilk,
	logStep: ParsingLoggerSilk,
): NamedMapDelta<NamedMapValueSilk> {
	logStep('parse_named_map_delta_start', {
		fieldType,
	});
	const delta = new NamedMapDelta<NamedMapValueSilk>(0);

	const upsertsCount = reader.readInt32();
	for (let i = 0; i < upsertsCount; i++) {
		const key = reader.readStringWithId(getStringIdToStringForField(field)) ?? '';
		const value = readNamedMapValue(reader, fieldType);
		delta.updates.set(key, value);
	}

	const removedCount = reader.readInt32();
	for (let i = 0; i < removedCount; i++) {
		delta.removals.add(reader.readStringWithId(getStringIdToStringForField(field)) ?? '');
	}

	logStep('parse_named_map_delta_complete', {
		fieldType,
		upsertsCount,
		removedCount,
	});

	return delta;
}
