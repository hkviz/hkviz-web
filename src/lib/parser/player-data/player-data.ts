import { playerDataFieldsGenerated } from '../../hk-data';
import { type BossSequenceDoorCompletion, type BossStatueCompletion } from './boss-completion';
import { BossSequenceData } from './boss-sequence';

const playerDataFieldsArray = Object.values(playerDataFieldsGenerated);

export type PlayerDataField = (typeof playerDataFieldsArray)[number];

// prettier-ignore
export type PlayerDataFieldValue<TField extends PlayerDataField> =
    TField['type'] extends 'Boolean' ? boolean :
    TField['type'] extends 'Int32' ? number :
    TField['type'] extends 'Single' ? number :
    TField['type'] extends 'List`1' ? string[] :
    TField['type'] extends 'Completion' ?
    // TODO possibly the player data should be extracted with full class paths
    TField['name'] extends `bossDoorStateTier${number}` ? BossSequenceDoorCompletion : BossStatueCompletion :
    TField['type'] extends 'BossSequenceData' ? BossSequenceData|null
    : string;
// prettier-ignore-end

// type PlayerDataFieldShortCode = PlayerDataField['shortCode'];
// type PlayerDataFieldByShortCode<T extends PlayerDataFieldShortCode> = Extract<PlayerDataField, { shortCode: T }>;

export const playerDataFields = {
    byFieldName: playerDataFieldsGenerated,
     
    byShortCode: Object.fromEntries(playerDataFieldsArray.map((it) => [it.shortCode, it])) as Record<
        string,
        PlayerDataField
    >,
    // this fancy types somehow do not build in vercel, but work locally. So no fancy types for now
    //  as any as {
    //     [Field in PlayerDataFieldShortCode]: PlayerDataFieldByShortCode<Field>;
    // },
};

export function parsePlayerDataFieldValue<TField extends PlayerDataField>(
    field: TField,
    value: string,
): PlayerDataFieldValue<TField> {
    if (field.type === 'Int32') {
         
        return parseInt(value) as any;
    } else if (field.type === 'Single') {
         
        return parseFloat(value) as any;
    } else if (field.type === 'Boolean') {
         
        return (value === '1') as any;
    } else if (field.type === 'List`1') {
         
        return value.split(',') as any;
    } else if (field.type === 'BossSequenceData') {
        const args = value.split(';');
        if (args[0] === 'null') {
             
            return null as any;
        } else {
             
            return new BossSequenceData(parseInt(args[0]!), args[1]!) as any;
        }
    } else {
         
        return value as any;
    }
}

export function getDefaultValue<TField extends PlayerDataField>(field: TField): PlayerDataFieldValue<TField> {
    return parsePlayerDataFieldValue(field, field.defaultValue);
}

// SUBSETS OF PLAYER DATA FIELDS
// bool
export type PlayerDataBoolField = Extract<PlayerDataField, { type: 'Boolean' }>;
export function isPlayerDataBoolField(field: PlayerDataField): field is PlayerDataBoolField {
    return field.type === 'Boolean';
}
// int
export type PlayerDataIntField = Extract<PlayerDataField, { type: 'Int32' }>;
export function isPlayerDataIntField(field: PlayerDataField): field is PlayerDataIntField {
    return field.type === 'Int32';
}

// kill
export type PlayerDataKilledField = Extract<PlayerDataField, { name: `killed${string}` }>;
export function isPlayerDataKilledField(field: PlayerDataField): field is PlayerDataKilledField {
    return field.name.startsWith('killed');
}
export function getEnemyNameFromKilledField(field: PlayerDataKilledField) {
    return field.name.slice('killed'.length);
}
// defeat
export type PlayerDataDefeatedField = Extract<PlayerDataField, { name: `${string}Defeated` }>;
export function isPlayerDataDefeatedField(field: PlayerDataField): field is PlayerDataDefeatedField {
    return field.name.endsWith('Defeated');
}
export function getEnemyNameFromDefeatedField(field: PlayerDataDefeatedField) {
    return field.name.slice(0, -'Defeated'.length);
}
// gotCharm
export type PlayerDataGotCharmField = Extract<PlayerDataField, { name: `gotCharm_${string}` }>;
export function isPlayerDataGotCharmField(field: PlayerDataField): field is PlayerDataGotCharmField {
    return field.name.startsWith('gotCharm_');
}
export function getCharmIdFromGotCharmField(field: PlayerDataGotCharmField) {
    return field.name.slice('gotCharm_'.length);
}
