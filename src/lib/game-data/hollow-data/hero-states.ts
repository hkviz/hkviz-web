import { heroStateFieldsGenerated } from './hero-state-fields.generated';

const heroStateFieldsArrayHollow = Object.values(heroStateFieldsGenerated);

export type HeroStateFieldHollow = (typeof heroStateFieldsArrayHollow)[number];

// type PlayerDataFieldShortCode = PlayerDataField['shortCode'];
// type PlayerDataFieldByShortCode<T extends PlayerDataFieldShortCode> = Extract<PlayerDataField, { shortCode: T }>;

export const heroStateFieldsHollow = {
	byFieldName: heroStateFieldsGenerated,

	byShortCode: Object.fromEntries(heroStateFieldsArrayHollow.map((it) => [it.shortCode, it])) as Record<
		string,
		HeroStateFieldHollow
	>,
	// this fancy types somehow do not build in vercel, but work locally. So no fancy types for now
	//  as any as {
	//     [Field in PlayerDataFieldShortCode]: PlayerDataFieldByShortCode<Field>;
	// },
};

// skipped parsing, since otherwise produce a lot of memory usage
// and are not used in the visualizations atm
export const heroStatesSkipParsingHollow = new Set<HeroStateFieldHollow>([
	heroStateFieldsHollow.byFieldName.facingRight,
	heroStateFieldsHollow.byFieldName.onGround,
	heroStateFieldsHollow.byFieldName.falling,
	heroStateFieldsHollow.byFieldName.shadowDashing,
	heroStateFieldsHollow.byFieldName.dashing,
	heroStateFieldsHollow.byFieldName.wallJumping,
	heroStateFieldsHollow.byFieldName.doubleJumping,
	heroStateFieldsHollow.byFieldName.onGround,
	heroStateFieldsHollow.byFieldName.attacking,
	heroStateFieldsHollow.byFieldName.jumping,
	heroStateFieldsHollow.byFieldName.invulnerable,
	heroStateFieldsHollow.byFieldName.altAttack,
	heroStateFieldsHollow.byFieldName.recoiling,
	heroStateFieldsHollow.byFieldName.recoilFrozen,
	heroStateFieldsHollow.byFieldName.willHardLand,
	heroStateFieldsHollow.byFieldName.swimming,
	heroStateFieldsHollow.byFieldName.freezeCharge,
	heroStateFieldsHollow.byFieldName.lookingDown,
	heroStateFieldsHollow.byFieldName.lookingUp,
	heroStateFieldsHollow.byFieldName.lookingDownAnim,
	heroStateFieldsHollow.byFieldName.shroomBouncing,
	heroStateFieldsHollow.byFieldName.lookingUpAnim,
	heroStateFieldsHollow.byFieldName.touchingNonSlider,
	heroStateFieldsHollow.byFieldName.touchingWall,
]);
