type RoomGroup = {
    readonly name: `group_${string}`;
    readonly sceneNames: readonly string[];
};

export const roomGroups = [
    {
        name: 'group_bretta',
        sceneNames: ['Room_Bretta_Basement', 'Room_Bretta'], // Dream_Mighty_Zote
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
