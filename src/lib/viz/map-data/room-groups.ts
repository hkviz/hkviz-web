import { formatZoneAndRoomName } from './room-name-formatting';

type RoomGroup = {
    readonly name: `group_${string}`;
    readonly sceneNames: readonly string[];
};

export const roomGroups = [
    {
        name: 'group_bretta',
        sceneNames: ['Room_Bretta', 'Room_Bretta_Basement', 'Dream_Mighty_Zote'],
    },
    {
        name: 'group_blackEggTemple',
        sceneNames: ['Room_temple', 'Room_Final_Boss_Atrium', 'Room_Final_Boss_Core', 'Dream_Final_Boss'], // add radiant room
    },
    {
        name: 'group_Fungus3_archive',
        sceneNames: ['Fungus3_archive', 'Fungus3_archive_02', 'Fungus3_archive_02_boss'],
    },
    {
        name: 'group_stone_sanctuary',
        sceneNames: ['Fungus1_35', 'Fungus1_36'],
    },
    {
        name: 'group_beasts_den',
        sceneNames: ['Deepnest_Spider_Town', 'Dream_Guardian_Hegemol'],
    },
    {
        name: 'group_grimm',
        sceneNames: ['Grimm_Main_Tent', 'Grimm_Nightmare'],
    },

    // pantheons
    {
        name: 'group_boss_seq:Boss Sequence Tier 1',
        sceneNames: [
            // 'GG_Boss_Door_Entrance',
            'GG_Vengefly',
            'GG_Gruz_Mother',
            'GG_False_Knight',
            'GG_Mega_Moss_Charger',
            'GG_Hornet_1',
            // 'GG_Spa',
            'GG_Ghost_Gorb',
            'GG_Dung_Defender',
            'GG_Mage_Knight',
            'GG_Brooding_Mawlek',
            // 'GG_Engine',
            'GG_Nailmasters',
        ].map((it) => `boss_seq:Boss Sequence Tier 1:${it}`),
    },
    {
        name: 'group_boss_seq:Boss Sequence Tier 2',
        sceneNames: [
            // 'GG_Boss_Door_Entrance',
            'GG_Ghost_Xero',
            'GG_Crystal_Guardian',
            'GG_Soul_Master',
            'GG_Oblobbles',
            'GG_Mantis_Lords',
            // 'GG_Spa',
            'GG_Ghost_Marmu',
            'GG_Nosk',
            'GG_Flukemarm',
            'GG_Broken_Vessel',
            //'GG_Engine',
            'GG_Painter',
            // 'GG_End_Sequence',
        ].map((it) => `boss_seq:Boss Sequence Tier 2:${it}`),
    },
    {
        name: 'group_boss_seq:Boss Sequence Tier 3',
        sceneNames: [
            'GG_Hive_Knight',
            'GG_Ghost_Hu',
            'GG_Collector',
            'GG_God_Tamer',
            'GG_Grimm',
            // 'GG_Spa',
            'GG_Ghost_Galien',
            'GG_Uumuu',
            'GG_Hornet_2',
            // 'GG_Engine',
            'GG_Sly',
            // 'GG_End_Sequence',
        ].map((it) => `boss_seq:Boss Sequence Tier 3:${it}`),
    },
    {
        name: 'group_boss_seq:Boss Sequence Tier 4',
        sceneNames: [
            'GG_Crystal_Guardian_2',
            'GG_Lost_Kin',
            'GG_Ghost_No_Eyes',
            'GG_Traitor_Lord',
            'GG_White_Defender',
            'GG_Spa',
            'GG_Failed_Champion',
            'GG_Ghost_Markoth',
            'GG_Watcher_Knights',
            'GG_Soul_Tyrant',
            // 'GG_Engine_Prime',
            'GG_Hollow_Knight',
            // 'GG_Door_5_Finale',
            // 'GG_End_Sequence',
        ].map((it) => `boss_seq:Boss Sequence Tier 4:${it}`),
    },
    {
        name: 'group_boss_seq:Boss Sequence Tier 5',
        sceneNames: [
            'GG_Vengefly_V',
            'GG_Gruz_Mother_V',
            'GG_False_Knight',
            'GG_Mega_Moss_Charger',
            'GG_Hornet_1',
            // 'GG_Engine',
            'GG_Ghost_Gorb_V',
            'GG_Dung_Defender',
            'GG_Mage_Knight_V',
            'GG_Brooding_Mawlek_V',
            'GG_Nailmasters',
            // 'GG_Spa',
            'GG_Ghost_Xero_V',
            'GG_Crystal_Guardian',
            'GG_Soul_Master',
            'GG_Oblobbles',
            'GG_Mantis_Lords_V',
            // 'GG_Spa',
            'GG_Ghost_Marmu_V',
            'GG_Flukemarm',
            'GG_Broken_Vessel',
            'GG_Ghost_Galien',
            'GG_Painter',
            // 'GG_Spa',
            'GG_Hive_Knight',
            'GG_Ghost_Hu',
            'GG_Collector_V',
            'GG_God_Tamer',
            'GG_Grimm',
            // 'GG_Spa',
            // 'GG_Unn',
            'GG_Watcher_Knights',
            'GG_Uumuu_V',
            'GG_Nosk_Hornet',
            'GG_Sly',
            'GG_Hornet_2',
            // 'GG_Spa',
            'GG_Crystal_Guardian_2',
            'GG_Lost_Kin',
            'GG_Ghost_No_Eyes_V',
            'GG_Traitor_Lord',
            'GG_White_Defender',
            // 'GG_Spa',
            // 'GG_Engine_Root',
            'GG_Soul_Tyrant',
            'GG_Ghost_Markoth_V',
            'GG_Grey_Prince_Zote',
            'GG_Failed_Champion',
            'GG_Grimm_Nightmare',
            // 'GG_Spa',
            // 'GG_Wyrm',
            'GG_Hollow_Knight',
            'GG_Radiance',
        ].map((it) => `boss_seq:Boss Sequence Tier 5:${it}`),
    },
] as const satisfies readonly RoomGroup[];

export const roomGroupNamesBySceneName = roomGroups
    .flatMap((group) =>
        group.sceneNames.map((sceneName) => ({
            sceneName,
            group,
        })),
    )
    .reduce((map, { sceneName, group }) => {
        const existingGroup = map.get(sceneName);
        if (existingGroup) {
            existingGroup.push(group.name);
        } else {
            map.set(sceneName, [group.name]);
        }
        return map;
    }, new Map<string, string[]>());
export type RoomGroupName = (typeof roomGroups)[number]['name'];
export function roomGroupName(name: RoomGroupName): RoomGroupName {
    return name;
}

export const roomGroupByName = new Map(roomGroups.map((group) => [group.name, group] as const));

export interface RelatedVirtualRoom {
    name: string;
    displayName: string;
}

export function getRelatedVirtualRoomNames(zoneName: string, virtualRoomName: string): RelatedVirtualRoom[] {
    if (!virtualRoomName || !zoneName) return [];

    const groups = virtualRoomName.startsWith('group_')
        ? roomGroups.filter((group) => group.name === virtualRoomName)
        : roomGroups.filter((group) => group.sceneNames.includes(virtualRoomName as never));

    return groups.flatMap((group) => {
        const allDisplayName = formatZoneAndRoomName(zoneName, group.name).roomNameFormattedZoneExclusive;
        return [
            {
                name: group.name,
                displayName: groups.length === 1 ? 'All' : allDisplayName,
            },
            ...group.sceneNames.map((sceneName) => ({
                name: sceneName,
                displayName: formatZoneAndRoomName(zoneName, sceneName)
                    .roomNameFormattedZoneExclusive.replace(allDisplayName + ' - ', '')
                    .replace(allDisplayName + ' ', ''),
            })),
        ];
    });
}
