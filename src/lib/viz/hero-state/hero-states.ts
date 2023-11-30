import { heroStateFieldsGenerated } from '../generated/hero-state-fields.generated';

const heroStateFieldsArray = Object.values(heroStateFieldsGenerated);

export type HeroStateField = (typeof heroStateFieldsArray)[number];

// type PlayerDataFieldShortCode = PlayerDataField['shortCode'];
// type PlayerDataFieldByShortCode<T extends PlayerDataFieldShortCode> = Extract<PlayerDataField, { shortCode: T }>;

export const heroStateFields = {
    byFieldName: heroStateFieldsGenerated,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    byShortCode: Object.fromEntries(heroStateFieldsArray.map((it) => [it.shortCode, it])),
    // this fancy types somehow do not build in vercel, but work locally. So no fancy types for now
    //  as any as {
    //     [Field in PlayerDataFieldShortCode]: PlayerDataFieldByShortCode<Field>;
    // },
};
