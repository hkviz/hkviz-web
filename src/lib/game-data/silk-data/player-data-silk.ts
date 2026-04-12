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

export const playerDataFieldsSilk = {
	byFieldName: fieldsWithName,
	byId,
};
