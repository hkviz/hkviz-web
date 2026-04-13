import { Vector3 } from '../shared/vector-3';
import { Vector2 } from '../shared/vectors';
import { playerDataGeneratedSilk } from './player-data-silk.generated';
import {
	CollectableItemsDataSilk,
	CollectableMementosDataSilk,
	CollectableRelicsDataSilk,
	EnemyJournalKillDataSilk,
	MateriumItemsDataSilk,
	QuestCompletionDataSilk,
	QuestRumourDataSilk,
	ToolCrestsDataSilk,
	ToolItemLiquidsDataSilk,
	ToolItemsDataSilk,
} from './types/player-data-custom-types-silk';

type PlayerDataGeneratedSilkFields = typeof playerDataGeneratedSilk.fields;

type PlayerDataFieldWithNameByKeySilk = {
	[K in keyof PlayerDataGeneratedSilkFields]: PlayerDataGeneratedSilkFields[K] & { name: K };
};

function withFieldNames<TFields extends Record<string, { id: number; type: string }>>(
	fields: TFields,
): { [K in keyof TFields]: TFields[K] & { name: K } } {
	for (const fieldName of Object.keys(fields) as (keyof TFields)[]) {
		(fields[fieldName] as TFields[keyof TFields] & { name: keyof TFields }).name = fieldName;
	}
	return fields as { [K in keyof TFields]: TFields[K] & { name: K } };
}

const fieldsWithName = withFieldNames(playerDataGeneratedSilk.fields);

const byId = new Map<number, PlayerDataFieldSilk>();
for (const fieldName of Object.keys(fieldsWithName) as PlayerDataFieldNameSilk[]) {
	const fieldData = fieldsWithName[fieldName];
	byId.set(fieldData.id, fieldData as any); // as any bc typechecker complexity too high.
}

export type PlayerDataFieldNameSilk = keyof typeof playerDataGeneratedSilk.fields;
export type PlayerDataFieldSilk = PlayerDataFieldWithNameByKeySilk[PlayerDataFieldNameSilk];
export type PlayerDataFieldTypeSilk = (typeof playerDataGeneratedSilk.fields)[PlayerDataFieldNameSilk]['type'];

// prettier-ignore
export type PlayerDataFieldValueSilk<TField extends PlayerDataFieldSilk> =
    TField['type'] extends 'bool' ? boolean :
    TField['type'] extends 'int' ? number :
    TField['type'] extends 'float' ? number :
    TField['type'] extends 'string' ? string :
    TField['type'] extends 'enum' ? number :
    TField['type'] extends 'ulong' ? number :

    TField['type'] extends 'list<string>' ? string[] :
    TField['type'] extends 'list<int>' ? number[] :
    TField['type'] extends 'int[]' ? number[] :

    TField['type'] extends 'hashset<string>' ? Set<string> :
    TField['type'] extends 'dictionary<string,bool>' ? Map<string, boolean> :
    TField['type'] extends 'dictionary<string,int>' ? Map<string, number> :
    TField['type'] extends 'wrappedvector2list[]' ? Vector2[][] :

    TField['type'] extends 'CollectableItemsData' ? Map<string, CollectableItemsDataSilk> :
    TField['type'] extends 'EnemyJournalKillData' ? Map<string, EnemyJournalKillDataSilk> :
    TField['type'] extends 'MateriumItemsData' ? Map<string, MateriumItemsDataSilk> :
    TField['type'] extends 'CollectableMementosData' ? Map<string, CollectableMementosDataSilk> :
    TField['type'] extends 'QuestCompletionData' ? Map<string, QuestCompletionDataSilk> :
    TField['type'] extends 'QuestRumourData' ? Map<string, QuestRumourDataSilk> :
    TField['type'] extends 'CollectableRelicsData' ? Map<string, CollectableRelicsDataSilk> :
    TField['type'] extends 'ToolCrestsData' ? Map<string, ToolCrestsDataSilk> :
    TField['type'] extends 'ToolItemLiquidsData' ? Map<string, ToolItemLiquidsDataSilk> :
    TField['type'] extends 'ToolItemsData' ? Map<string, ToolItemsDataSilk> :

    TField['type'] extends 'guid' ? string :
    TField['type'] extends 'vector2' ? Vector2 :
    TField['type'] extends 'vector3' ? Vector3 :
    never;
// prettier-ignore-end

export const playerDataFieldsSilk = {
	byFieldName: fieldsWithName,
	byId,
};
