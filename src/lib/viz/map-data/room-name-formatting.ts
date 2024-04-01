const ancientBasinRooms = [
    'Abyss_02',
    'Abyss_03',
    'Abyss_04',
    'Abyss_05',
    'Abyss_17',
    'Abyss_18',
    'Abyss_19',
    'Abyss_20',
    'Abyss_21',
];

const predefinedRoomNames = {
    // Dirtmouth
    Town: 'Town',
    Room_shop: "Sly's Shop",
    Room_Ouiji: "Jiji's Hut",
    Room_Town_Stag_Station: 'Stag Station',
    Room_mapper: 'Map Shop',
    group_bretta: "Bretta's House",
    Room_Bretta_Basement: "Bretta's House Basement",
    Room_Bretta: "Bretta's House Ground Floor",
    Dream_Mighty_Zote: 'Prince Zote Dream',

    group_grimm: "Grimm's Tent",
    Grimm_Divine: "Divine's Tent",

    // Crossroads
    Crossroads_49: 'Elevator',
    Crossroads_47: 'Stag Station',
    Crossroads_ShamanTemple: 'Ancestral Mound',
    Room_ruinhouse: "Sly's Hideout",
    Room_Mender_House: "Menderbug's house",
    Room_Charm_Shop: "Salubra's Shop",
    group_blackEggTemple: 'Black Egg Temple',
    Room_temple: 'Black Egg Temple - Entrance',
    Room_Final_Boss_Atrium: 'Black Egg Temple - Atrium',
    Room_Final_Boss_Core: 'Black Egg Temple - Hollow Knight',
    Dream_Final_Boss: 'Black Egg Temple - Radiance',

    // Greenpath
    Fungus1_16_alt: 'Stag Station',
    group_stone_sanctuary: 'Stone Sanctuary',
    Fungus1_35: 'Stone Sanctuary No Eyes',
    Fungus1_36: 'Stone Sanctuary Right Room',
    Room_nailmaster_02: 'Nailmaster Sheo',
    Fungus1_26: 'Lake of Unn',
    Room_Slug_Shrine: 'Lake of Unn Shrine',

    // Cliffs
    Room_nailmaster: 'Nailmaster Mato',

    // Fog canyon
    Room_Fungus_Shaman: 'Overgrown Mound',
    group_Fungus3_archive: "Teacher's Archives",
    Fungus3_archive: "Teacher's Archives Entrance",
    Fungus3_archive_02: "Teacher's Archives Middle Room",
    Fungus3_archive_02_boss: "Teacher's Archives Uumuu",

    // Fungal wastes
    Fungus2_01: 'Queen Station Hub',
    Fungus2_02: 'Queen Station Stag',
    Fungus2_34: 'Queen Station Willoh',

    // City of tears
    Ruins2_10b: 'East elevator', // from city of tears
    Ruins2_10: 'Elevator', // from resting grounds
    Ruins_Elevator: 'Pleasure House Elevator',
    Ruins_Bathhouse: 'Pleasure House',
    Ruins2_06: 'Kings Station Hub',
    Ruins2_08: 'Kings Station Stag',
    Ruins2_07: 'Kings Station Broken Stag',
    Ruins2_11_b: 'Tower of Love Lower',
    Ruins2_11: 'Tower of Love Upper',

    Ruins1_29: 'Storerooms Stag',
    Ruins1_28: 'Storerooms Upper',
    Ruins1_17: 'Storerooms Lower',
    Crossroads_49b: 'Storerooms Elevator',
    Room_nailsmith: "Nailsmith's Forge",

    Ruins_House_03: "Emilitia's House",
    Ruins_House_02: 'Gorgeous Husk House',
    Ruins_House_01: 'Grub House',

    // Waterways
    Waterways_13: "Isma's Grove",
    GG_Waterways: 'Junk Pit',
    GG_Pipeway: 'Pipeway',

    Abyss_06_Core: 'Core',
    Abyss_15: 'Birthplace',
    Abyss_08: 'Lifeblood Chamber',

    // Resting grounds
    RestingGrounds_09: 'Stag Station',
    Abyss_22: 'Hidden Station',
    RestingGrounds_08: "Spirits' Glade",
    RestingGrounds_07: "Seer's Room",
    Room_Mansion: "Grey Mourner's House",
    Crossroads_50: 'Blue Lake',

    // Deepnest
    Deepnest_09: 'Stag Station',
    group_beasts_den: "Beast's Den",
    Deepnest_Spider_Town: "Beast's Den Non Dream",
    Dream_Guardian_Hegemol: "Beast's Den Herrah's Dream",
    Room_spider_small: 'Small Weaver Room',
    // TODO 'Weaver's Den',

    // Queens garden
    Fungus3_40: 'Stag Station',

    // Kingdoms edge
    Room_Colosseum_Bronze: 'Trial of the Warrior',
    Room_Colosseum_Silver: 'Trial of the Conqueror',
    Room_Colosseum_Gold: 'Trial of the Fool',
    Room_nailmaster_03: 'Nailmaster Oro',

    // Crystal Peak
    Mines_35: 'Crystallised Mound',
} as Record<string, string>;

export function formatRoomName(zoneName: string | undefined, roomName: string) {
    const predefinedName = predefinedRoomNames[roomName];
    if (predefinedName) return predefinedName;

    if (ancientBasinRooms.includes(roomName)) {
        return roomName.replace('Abyss_', 'Ancient Basin ');
    }

    let formattedRoomName = roomName
        // Pantheons
        .replace(/(group_)?boss_seq:Boss Sequence Tier 1(\:GG)?/g, 'Pantheon of the Master ')
        .replace(/(group_)?boss_seq:Boss Sequence Tier 2(\:GG)?/g, 'Pantheon of the Artist ')
        .replace(/(group_)?boss_seq:Boss Sequence Tier 3(\:GG)?/g, 'Pantheon of the Sage ')
        .replace(/(group_)?boss_seq:Boss Sequence Tier 4(\:GG)?/g, 'Pantheon of the Knight ')
        .replace(/(group_)?boss_seq:Boss Sequence Tier 5(\:GG)?/g, 'Pantheon of the Hallownest ')

        // Area names
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

    switch (zoneName) {
        case 'ABYSS':
            return 'The Abyss';
        case 'CITY':
            return 'City of Tears';
        case 'MINES':
            return 'Crystal Peak';
        case 'DEEPNEST':
            return 'Deepnest';
        case 'TOWN':
            return 'Dirtmouth';
        case 'FOG_CANYON':
            return 'Fog Canyon';
        case 'CROSSROADS':
            return 'Forgotten Crossroads';
        case 'WASTES':
            return 'Fungal Wastes';
        case 'GODS_GLORY':
            return 'Godhome';
        case 'GREEN_PATH':
            return 'Greenpath';
        // handled above: case 'HIVE': return 'Hive';
        case 'CLIFFS':
            return 'Howling Cliffs';
        case 'OUTSKIRTS':
            return "Kingdom's Edge";
        case 'ROYAL_GARDENS':
            return "Queen's Gardens";
        case 'RESTING_GROUNDS':
            return 'Resting Grounds';
        case 'WATERWAYS':
            return 'Royal Waterways';
        case 'WHITE_PALACE':
            return 'White Palace';
        default:
            return zoneName as never;
    }
}
export type ZoneNameFormatted = ReturnType<typeof formatZoneName>;

export function formatZoneAndRoomName(
    zoneName: string | undefined,
    roomName: string,
): {
    zoneNameFormatted: ZoneNameFormatted;
    roomNameFormatted: string;
    roomNameFormattedZoneExclusive: string;
} {
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
