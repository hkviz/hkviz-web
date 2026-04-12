import { Vector3 } from '../shared/vector-3';
import { Vector2 } from '../shared/vectors';
import { playerDataGeneratedSilk } from './player-data-silk.generated';

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
	byId.set(fieldData.id, fieldData);
}

export type PlayerDataFieldNameSilk = keyof typeof playerDataGeneratedSilk.fields;
export type PlayerDataFieldSilk = PlayerDataFieldWithNameByKeySilk[PlayerDataFieldNameSilk];
export type PlayerDataFieldTypeSilk = (typeof playerDataGeneratedSilk.fields)[PlayerDataFieldNameSilk]['type'];

// prettier-ignore
export type PlayerDataFieldValue<TField extends PlayerDataFieldSilk> =
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
    TField['type'] extends 'wrappedvector2list[]' ? Vector2[][] :

    TField['type'] extends 'guid' ? string :
    TField['type'] extends 'vector2' ? Vector2 :
    TField['type'] extends 'vector3' ? Vector3 :
    never;
// prettier-ignore-end

export const playerDataFieldsSilk = {
	byFieldName: fieldsWithName,
	byId,
};
