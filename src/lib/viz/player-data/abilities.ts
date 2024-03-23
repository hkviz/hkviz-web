import { type PlayerDataField } from './player-data';

export type AbilityType = 'ability' | 'item';
export interface AbilityOrItem {
    name: string;
    spriteName: string;
    type: AbilityType;
}

export const abilitiesAndItems: Record<
    PlayerDataField['name'] &
        (
            | `has${string}`
            | 'gotLurkerKey'
            | 'slySimpleKey'
            | 'simpleKeys'
            | 'xunFlowerBroken'
            | 'salubraBlessing'
            | 'ore'
        ),
    AbilityOrItem | undefined
> = {
    // nail arts
    hasAllNailArts: undefined,
    hasNailArt: undefined,
    hasCyclone: { name: 'Cyclone Slash', spriteName: 'Inv_0023_inv_whirlwind_skill', type: 'ability' },
    hasDashSlash: { name: 'Dash Slash', spriteName: 'Inv_0022_inv_uppercut_skill', type: 'ability' },
    hasUpwardSlash: { name: 'Great Slash', spriteName: 'Inv_0021_inv_dash_strike_skill', type: 'ability' },

    // spells
    hasSpell: undefined,
    // TODO: all spells

    // map
    hasMarker: undefined,
    hasMarker_b: undefined,
    hasMarker_r: undefined,
    hasMarker_w: undefined,
    hasMarker_y: undefined,
    hasPin: undefined,
    hasPinShop: undefined,
    hasPinBench: undefined,
    hasPinStag: undefined,
    hasPinBlackEgg: undefined,
    hasPinCocoon: undefined,
    hasPinDreamPlant: undefined,
    hasPinGhost: undefined,
    hasPinGrub: undefined,
    hasPinGuardian: undefined,
    hasPinSpa: undefined,
    hasPinTram: undefined,

    // abilities
    hasDash: { name: 'Mothwing Cloak', spriteName: 'Inv_0015_dash-cloak', type: 'ability' },
    hasWalljump: { name: 'Mantis Claw', spriteName: 'items__0003_mantis-claw', type: 'ability' },
    hasSuperDash: { name: 'Crystal Heart', spriteName: 'items__0000_crystal-heart', type: 'ability' },
    hasDoubleJump: { name: 'Monarch Wings', spriteName: 'items__0002_emperor-wings', type: 'ability' },
    hasAcidArmour: { name: "Isma's Tear", spriteName: 'items__0001_acid-armour', type: 'ability' },
    hasShadowDash: { name: 'Shade Cloak', spriteName: 'items__0004_shade_cloak', type: 'ability' },
    hasDreamNail: { name: 'Dream Nail', spriteName: 'dream_nail_0003_1', type: 'ability' },
    // TODO awoken dream nail
    // TODO world sense
    hasDreamGate: { name: 'Dreamgate', spriteName: 'Dream_Gate_Pin_0000_3', type: 'ability' },

    // items https://hollowknight.wiki/w/Category:Items_(Hollow_Knight)
    // keys (maybe add later)?
    hasMenderKey: undefined, // i think used var
    hasWaterwaysKey: undefined, // i think used var
    hasSpaKey: undefined, // i think used var
    gotLurkerKey: undefined, // { name: 'Simple Key (Pale Lurker)', spriteName: 'inv_item__00014_graveyard_key', type: 'item' },
    slySimpleKey: undefined, // { name: 'Simple Key (Sly)', spriteName: 'inv_item__00014_graveyard_key', type: 'item' },

    simpleKeys: { name: 'Simple Key', spriteName: 'inv_item__00014_graveyard_key', type: 'item' },
    hasWhiteKey: { name: 'Elegant Key', spriteName: 'Elegant_Key', type: 'item' },
    hasLoveKey: { name: 'Love Key', spriteName: 'inv_Love_Key', type: 'item' },
    hasSlykey: { name: "Shopkeeper's Key", spriteName: 'inv_item__0002_storeroom_key', type: 'item' },
    hasCityKey: { name: 'City Crest', spriteName: 'inv_item_city_key', type: 'item' },
    hasKingsBrand: { name: "King's Brand", spriteName: 'inv_white_brand', type: 'item' },

    // exploration and quest
    hasTramPass: { name: 'Tram Pass', spriteName: 'inv_item__0001_tram_pass', type: 'item' },
    hasLantern: { name: 'Lumafly Lantern', spriteName: 'Lumafly_Lantern0000', type: 'item' },
    hasMap: { name: 'Map', spriteName: 'inv_item__0008_jar_col_map', type: 'item' },
    hasQuill: { name: 'Quill', spriteName: 'inv_item_map_quill_combined', type: 'item' },
    hasJournal: { name: "Hunter's Journal", spriteName: 'Journal_Prompt', type: 'item' },
    hasHuntersMark: { name: "Hunter's Mark", spriteName: 'bestiary_hunter_mark_f', type: 'item' },

    hasXunFlower: undefined, // { name: 'Delicate Flower', spriteName: 'White_Flower_Full', type: 'item' },
    xunFlowerBroken: undefined, //{ name: 'Ruined Flower', spriteName: 'White_Flower_Half', type: 'item' },
    hasGodfinder: { name: 'Godtuner', spriteName: 'GG_IU_Godfinder0009_complete', type: 'item' },
    salubraBlessing: { name: "Salubra's Blessing", spriteName: 'shop_blessing', type: 'item' },
    hasCharm: undefined,

    // tradables
    ore: { name: 'Pale Ore', spriteName: 'inv_item__0009_ore', type: 'item' },
};

export function isPlayerDataAbilityOrItemField(
    field: PlayerDataField,
): field is PlayerDataField & { name: keyof typeof abilitiesAndItems } {
    return field.name in abilitiesAndItems;
}
