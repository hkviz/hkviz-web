import { formatZoneAndRoomName } from './room-name-formatting';

type RoomGroup = {
    readonly name: `group_${string}` | `boss_seq:${string}`;
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

    // pantheons
    {
        name: 'boss_seq:Boss Sequence Tier 1',
        sceneNames: [
            'GG_Boss_Door_Entrance',
            'GG_Vengefly',
            'GG_Gruz_Mother',
            'GG_False_Knight',
            'GG_Mega_Moss_Charger',
            'GG_Hornet_1',
            'GG_Spa',
            'GG_Ghost_Gorb',
            'GG_Dung_Defender',
            'GG_Mage_Knight',
            'GG_Brooding_Mawlek',
            'GG_Engine',
            'GG_Nailmasters',
        ].map((it) => `boss_seq:Boss Sequence Tier 1:${it}`),
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
