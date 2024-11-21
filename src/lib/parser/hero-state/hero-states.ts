import { heroStateFieldsGenerated } from '../../hk-data';

const heroStateFieldsArray = Object.values(heroStateFieldsGenerated);

export type HeroStateField = (typeof heroStateFieldsArray)[number];

// type PlayerDataFieldShortCode = PlayerDataField['shortCode'];
// type PlayerDataFieldByShortCode<T extends PlayerDataFieldShortCode> = Extract<PlayerDataField, { shortCode: T }>;

export const heroStateFields = {
    byFieldName: heroStateFieldsGenerated,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    byShortCode: Object.fromEntries(heroStateFieldsArray.map((it) => [it.shortCode, it])) as Record<
        string,
        HeroStateField
    >,
    // this fancy types somehow do not build in vercel, but work locally. So no fancy types for now
    //  as any as {
    //     [Field in PlayerDataFieldShortCode]: PlayerDataFieldByShortCode<Field>;
    // },
};

// skipped parsing, since otherwise produce a lot of memory usage
// and are not used in the visualizations atm
export const heroStatesSkipParsing = new Set<HeroStateField>([
    heroStateFields.byFieldName.facingRight,
    heroStateFields.byFieldName.onGround,
    heroStateFields.byFieldName.falling,
    heroStateFields.byFieldName.shadowDashing,
    heroStateFields.byFieldName.dashing,
    heroStateFields.byFieldName.wallJumping,
    heroStateFields.byFieldName.doubleJumping,
    heroStateFields.byFieldName.onGround,
    heroStateFields.byFieldName.attacking,
    heroStateFields.byFieldName.jumping,
    heroStateFields.byFieldName.invulnerable,
    heroStateFields.byFieldName.altAttack,
    heroStateFields.byFieldName.recoiling,
    heroStateFields.byFieldName.recoilFrozen,
    heroStateFields.byFieldName.willHardLand,
    heroStateFields.byFieldName.swimming,
    heroStateFields.byFieldName.freezeCharge,
    heroStateFields.byFieldName.lookingDown,
    heroStateFields.byFieldName.lookingUp,
    heroStateFields.byFieldName.lookingDownAnim,
    heroStateFields.byFieldName.shroomBouncing,
    heroStateFields.byFieldName.lookingUpAnim,
    heroStateFields.byFieldName.touchingNonSlider,
    heroStateFields.byFieldName.touchingWall,
]);
