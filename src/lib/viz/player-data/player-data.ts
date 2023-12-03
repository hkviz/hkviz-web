import { playerDataFieldsGenerated } from '../generated/player-data-fields.generated';

const playerDataFieldsArray = Object.values(playerDataFieldsGenerated);

export type PlayerDataField = (typeof playerDataFieldsArray)[number];

export type PlayerDataFieldValue<TField extends PlayerDataField> = TField['type'] extends 'Int32'
    ? number
    : TField['type'] extends 'List`1'
    ? string[]
    : string;

// type PlayerDataFieldShortCode = PlayerDataField['shortCode'];
// type PlayerDataFieldByShortCode<T extends PlayerDataFieldShortCode> = Extract<PlayerDataField, { shortCode: T }>;

export const playerDataFields = {
    byFieldName: playerDataFieldsGenerated,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    byShortCode: Object.fromEntries(playerDataFieldsArray.map((it) => [it.shortCode, it])) as Record<
        string,
        PlayerDataField
    >,
    // this fancy types somehow do not build in vercel, but work locally. So no fancy types for now
    //  as any as {
    //     [Field in PlayerDataFieldShortCode]: PlayerDataFieldByShortCode<Field>;
    // },
};
