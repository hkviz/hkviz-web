const ancientBasinRooms = [
    'Abyss_02',
    'Abyss_03',
    'Abyss_04',
    'Abyss_05',
    'Abyss_18',
    'Abyss_19',
    'Abyss_20',
    'Abyss_21',
];

export function formatRoomName(zoneName: string | undefined, roomName: string) {
    if (roomName === 'GG_Waterways') {
        return 'Royal Waterways Junk Pit';
    } else if (roomName === 'GG_Pipeway') {
        return 'Royal Waterways Pipeway';
    } else if (ancientBasinRooms.includes(roomName)) {
        return roomName.replace('Abyss_', 'Ancient Basin ');
    }

    let formattedRoomName = roomName
        .replace('Abyss', 'The Abyss')
        // handled above .replace('-', 'Ancient Basin')
        .replace('Ruins', 'City of Tears') // Ruins1 and Ruins2 are both City of Tears
        // TODO maybe .replace('-', 'Colosseum of Fools')
        .replace('Mines', 'Crystal Peak')
        // already correct .replace('Deepnest_', 'Deepnest_')
        .replace('Town', 'Dirtmouth')
        // all rooms called queens garden, handled below .replace('-', 'Fog Canyon')
        .replace('Crossroads', 'Forgotten Crossroads')
        .replace('Fungus2', 'Fungal Wastes')
        .replace('GG', 'Godhome')
        .replace('Fungus1', 'Greenpath')
        .replace('Hive', 'Hive')
        .replace('Cliffs', 'Howling Cliffs')
        .replace('Deepnest_East_', "Kingdom's Edge")
        .replace('Fungus3', "Queen's Gardens")
        .replace('RestingGrounds', 'Resting Grounds')
        .replace('Waterways', 'Royal Waterways')
        .replace('White_Palace_', 'White Palace')
        .replace('Tutorial_01', "King's Pass")

        .replace('_v02', '')
        .replace(/_/g, ' ')
        .trim();

    if (zoneName === 'FOG_CANYON') {
        // all fog canyon rooms are called queens garden ingame
        formattedRoomName = formattedRoomName.replace("Queen's Gardens", 'Fog Canyon');
    }

    return formattedRoomName;
}

export function formatZoneName(zoneName: string | undefined, roomName: string) {
    if (roomName.startsWith('Hive')) {
        return 'Hive';
    } else if (ancientBasinRooms.includes(roomName)) {
        return 'Ancient Basin';
    }

    if (!zoneName) return 'Unknown area';
    return (
        zoneName
            .replace('ABYSS', 'The Abyss')
            // handled above .replace('-', 'Ancient Basin')
            .replace('CITY', 'City of Tears')
            // TODO maybe later .replace('-', 'Colosseum of Fools')
            .replace('MINES', 'Crystal Peak')
            .replace('DEEPNEST', 'Deepnest')
            .replace('TOWN', 'Dirtmouth')
            .replace('FOG_CANYON', 'Fog Canyon')
            .replace('CROSSROADS', 'Forgotten Crossroads')
            .replace('WASTES', 'Fungal Wastes')
            .replace('GODS_GLORY', 'Godhome')
            .replace('GREEN_PATH', 'Greenpath')
            // handled above .replace('-', 'Hive')
            .replace('Cliffs', 'Howling Cliffs')
            .replace('OUTSKIRTS', "Kingdom's Edge")
            .replace('ROYAL_GARDENS', "Queen's Gardens")
            .replace('RESTING_GROUNDS', 'Resting Grounds')
            .replace('WATERWAYS', 'Royal Waterways')
            .replace('WHITE_PALACE', 'White Palace')
    );
}

export function formatZoneAndRoomName(zoneName: string | undefined, roomName: string) {
    const zoneNameFormatted = formatZoneName(zoneName, roomName);
    const roomNameFormatted = formatRoomName(zoneName, roomName);

    return {
        zoneNameFormatted: zoneNameFormatted,
        roomNameFormatted: roomNameFormatted,
        roomNameFormattedZoneExclusive: roomNameFormatted.startsWith(zoneNameFormatted)
            ? roomNameFormatted.slice(zoneNameFormatted.length).trim()
            : roomNameFormatted,
    };
}
