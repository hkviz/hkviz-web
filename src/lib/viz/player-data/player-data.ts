import { playerDataFieldsGenerated } from '../generated/player-data-fields.generated';

const playerDataFieldsArray = Object.values(playerDataFieldsGenerated);

export type PlayerDataField = (typeof playerDataFieldsArray)[number];

// type PlayerDataFieldShortCode = PlayerDataField['shortCode'];
// type PlayerDataFieldByShortCode<T extends PlayerDataFieldShortCode> = Extract<PlayerDataField, { shortCode: T }>;

export const playerDataFields = {
    byFieldName: playerDataFieldsGenerated,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    byShortCode: Object.fromEntries(playerDataFieldsArray.map((it) => [it.shortCode, it])),
    // this fancy types somehow do not build in vercel, but work locally. So no fancy types for now
    //  as any as {
    //     [Field in PlayerDataFieldShortCode]: PlayerDataFieldByShortCode<Field>;
    // },
};
