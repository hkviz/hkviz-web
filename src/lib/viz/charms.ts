import { raise } from '../utils/utils';
import { charmsGenerated } from './generated/charms.generated';
import { uiLangGenerated } from './generated/lang-ui.generated';
import { FrameEndEvent } from './recording-files/events/frame-end-event';

function parseHtmlEntities(str: string): string {
    return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
        const num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
    });
}

const charmsArray = charmsGenerated.map((charm) => {
    const name = (uiLangGenerated as any)['CHARM_NAME_' + charm.charmId];
    return {
        id: charm.charmId,
        name: name ? parseHtmlEntities(name) : undefined,
        spriteName: charm.spriteName,
    };
});

export const charms = {
    byId: Object.fromEntries(charmsArray.map((charm) => [charm.id, charm])),
};

export type CharmInfo = (typeof charmsArray)[number];

type GetCharmId<T> = T extends `gotCharm_${infer N}` ? N : never;
type CharmPlayerDataId = GetCharmId<keyof FrameEndEvent>;

function defaultHasCharm(charmId: CharmPlayerDataId): (frameEndEvent: FrameEndEvent) => boolean {
    return (frameEndEvent) => frameEndEvent[`gotCharm_${charmId}`] === true;
}

function defaultSpriteName(charmId: CharmPlayerDataId): string {
    return charmsGenerated.find((charm) => charm.charmId === charmId)?.spriteName ?? raise(new Error('No sprite name'));
}

export interface VirtualCharm {
    id: string;
    name: string;
    spriteName: string;
    hasCharm: (frameEndEvent: FrameEndEvent) => boolean;
}

function makeVirtualCharm({
    id,
    name,
    playerDataId,
    spriteName = defaultSpriteName(playerDataId!),
    hasCharm = defaultHasCharm(playerDataId!),
}: {
    id: string;
    name: string;
    playerDataId?: CharmPlayerDataId;
    spriteName?: string;
    hasCharm?: (frameEndEvent: FrameEndEvent) => boolean;
}): VirtualCharm {
    return {
        id,
        name,
        hasCharm,
        spriteName,
    };
}

// not directly coming form save state, but from a few fields
// and in the future potentially from the installed mods
export const virtualCharms: VirtualCharm[] = [
    makeVirtualCharm({
        id: 'charm_vanilla_waywardCompass',
        name: 'Wayward Compass',
        playerDataId: '2',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_gatheringSwarm',
        name: 'Gathering Swarm',
        playerDataId: '1',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_stalwartShell',
        name: 'Stalwart Shell',
        playerDataId: '4',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_soulCatcher',
        name: 'Soul Catcher',
        playerDataId: '20',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_shamanStone',
        name: 'Shaman Stone',
        playerDataId: '19',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_soulEater',
        name: 'Soul Eater',
        playerDataId: '21',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_dashmaster',
        name: 'Dashmaster',
        playerDataId: '31',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_thornsOfAgony',
        name: 'Thorns of Agony',
        playerDataId: '12',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_furyOfTheFallen',
        name: 'Fury of the Fallen',
        playerDataId: '6',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_fragileHeart',
        name: 'Fragile Heart',
        playerDataId: '23',
        spriteName: '_0002_charm_glass_heal_broken',
        hasCharm: (frameEndEvent) =>
            !frameEndEvent.brokenCharm_23 && !frameEndEvent.fragileHealth_unbreakable && frameEndEvent.gotCharm_23,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_fragileHeart_broken',
        name: 'Fragile Heart',
        playerDataId: '23',
        spriteName: '_0002_charm_glass_heal_broken',
        hasCharm: (frameEndEvent) =>
            frameEndEvent.brokenCharm_23 && !frameEndEvent.fragileHealth_unbreakable && frameEndEvent.gotCharm_23,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_fragileGreed',
        name: 'Fragile Greed',
        playerDataId: '24',
        spriteName: '_0003_charm_glass_geo',
        hasCharm: (frameEndEvent) =>
            !frameEndEvent.brokenCharm_24 && !frameEndEvent.fragileGreed_unbreakable && frameEndEvent.gotCharm_24,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_fragileGreed_broken',
        name: 'Fragile Greed',
        playerDataId: '24',
        spriteName: '_0003_charm_glass_geo_broken',
        hasCharm: (frameEndEvent) =>
            frameEndEvent.brokenCharm_24 && !frameEndEvent.fragileGreed_unbreakable && frameEndEvent.gotCharm_24,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_fragileStrength',
        name: 'Fragile Strength',
        playerDataId: '25',
        spriteName: '_0002_charm_glass_attack_up',
        hasCharm: (frameEndEvent) =>
            !frameEndEvent.brokenCharm_25 && !frameEndEvent.fragileStrength_unbreakable && frameEndEvent.gotCharm_25,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_fragileStrength_broken',
        name: 'Fragile Strength',
        playerDataId: '25',
        spriteName: '_0002_charm_glass_attack_up_broken',
        hasCharm: (frameEndEvent) =>
            frameEndEvent.brokenCharm_25 && !frameEndEvent.fragileStrength_unbreakable && frameEndEvent.gotCharm_25,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_unbreakableHeart',
        name: 'Unbreakable Heart',
        playerDataId: '23',
        hasCharm: (frameEndEvent) => frameEndEvent.fragileHealth_unbreakable && frameEndEvent.gotCharm_23,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_unbreakableGreed',
        name: 'Unbreakable Greed',
        playerDataId: '24',
        hasCharm: (frameEndEvent) => frameEndEvent.fragileHealth_unbreakable && frameEndEvent.gotCharm_23,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_unbreakableStrength',
        name: 'Unbreakable Strength',
        playerDataId: '25',
        hasCharm: (frameEndEvent) => frameEndEvent.fragileHealth_unbreakable && frameEndEvent.gotCharm_23,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_spellTwister',
        name: 'Spell Twister',
        playerDataId: '33',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_steadyBody',
        name: 'Steady Body',
        playerDataId: '14',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_heavyBlow',
        name: 'Heavy Blow',
        playerDataId: '15',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_quickSlash',
        name: 'Quick Slash',
        playerDataId: '32',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_longnail',
        name: 'Longnail',
        playerDataId: '18',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_markOfPride',
        name: 'Mark of Pride',
        playerDataId: '13',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_baldurShell',
        name: 'Baldur Shell',
        playerDataId: '5',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_flukenest',
        name: 'Flukenest',
        playerDataId: '11',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_defendersCrest',
        name: "Defender's Crest",
        playerDataId: '10',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_glowingWomb',
        name: 'Glowing Womb',
        playerDataId: '22',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_quickFocus',
        name: 'Quick Focus',
        playerDataId: '7',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_deepFocus',
        name: 'Deep Focus',
        playerDataId: '34',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_lifebloodHeart',
        name: 'Lifeblood Heart',
        playerDataId: '8',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_lifebloodCore',
        name: 'Lifeblood Core',
        playerDataId: '9',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_jonisBlessing',
        name: "Jonis' Blessing",
        playerDataId: '27',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_grubsong',
        name: 'Grubsong',
        playerDataId: '3',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_hiveblood',
        name: 'Hiveblood',
        playerDataId: '29',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_sporeShroom',
        name: 'Spore Shroom',
        playerDataId: '17',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_sharpShadow',
        name: 'Sharp Shadow',
        playerDataId: '16',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_shapeOfUnn',
        name: 'Shape of Unn',
        playerDataId: '28',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_nailmastersGlory',
        name: "Nailmaster's Glory",
        playerDataId: '26',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_dreamWielder',
        name: 'Dream Wielder',
        playerDataId: '30',
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_kingsoul_left',
        name: 'White Fragment',
        playerDataId: '36',
        spriteName: 'charm_white_left',
        hasCharm: (frameEndEvent) => frameEndEvent.royalCharmState === 1 && frameEndEvent.gotCharm_36,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_kingsoul_right',
        name: 'White Fragment',
        playerDataId: '36',
        spriteName: 'charm_white_right',
        hasCharm: (frameEndEvent) => frameEndEvent.royalCharmState === 2 && frameEndEvent.gotCharm_36,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_kingsoul',
        name: 'Kingsoul',
        playerDataId: '36',
        spriteName: 'charm_white_full',
        hasCharm: (frameEndEvent) => frameEndEvent.royalCharmState === 3 && frameEndEvent.gotCharm_36,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_void_heart',
        name: 'Void Heart',
        playerDataId: '36',
        spriteName: 'charm_black',
        hasCharm: (frameEndEvent) => frameEndEvent.royalCharmState === 4 && frameEndEvent.gotCharm_36,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_grimmchild_level_1',
        name: 'Grimmchild (Phase 1)',
        playerDataId: '40',
        spriteName: 'charm_grimmkin_01',
        hasCharm: (frameEndEvent) => frameEndEvent.grimmChildLevel === 1 && frameEndEvent.gotCharm_40,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_grimmchild_level_2',
        name: 'Grimmchild (Phase 2)',
        playerDataId: '40',
        spriteName: 'charm_grimmkin_02',
        hasCharm: (frameEndEvent) => frameEndEvent.grimmChildLevel === 2 && frameEndEvent.gotCharm_40,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_grimmchild_level_3',
        name: 'Grimmchild (Phase 3)',
        playerDataId: '40',
        spriteName: 'charm_grimmkin_03',
        hasCharm: (frameEndEvent) => frameEndEvent.grimmChildLevel === 3 && frameEndEvent.gotCharm_40,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_grimmchild_level_4',
        name: 'Grimmchild (Phase 4)',
        playerDataId: '40',
        spriteName: 'charm_grimmkin_04',
        hasCharm: (frameEndEvent) => frameEndEvent.grimmChildLevel === 4 && frameEndEvent.gotCharm_40,
    }),
    makeVirtualCharm({
        id: 'charm_vanilla_carefreeMelody',
        name: 'Carefree Melody',
        playerDataId: '40',
        spriteName: 'charm_grimmkin_05',
        hasCharm: (frameEndEvent) => frameEndEvent.grimmChildLevel === 5 && frameEndEvent.gotCharm_40,
    }),
];
