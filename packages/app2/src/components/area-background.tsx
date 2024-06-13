import { type MapZone, assertNever } from '@hkviz/parser';

/*
Matches can be extracted using c# repl using Explorer Mod for Hollow Knight. Using the following script:

    var x = GameObject.Find("SaveSlots").GetComponent<SaveSlotBackgrounds>().areaBackgrounds;

    foreach (var it in x) {
        Log(it.areaName + " " + it.backgroundImage.name);
    }

    logs:
    
    [INFO]:[UExplorer] - [Explorer] TOWN Area_Dirtmouth
    [INFO]:[UExplorer] - [Explorer] CROSSROADS Area_Forgotten Crossroads
    [INFO]:[UExplorer] - [Explorer] GREEN_PATH Area_Green_Path
    [INFO]:[UExplorer] - [Explorer] ROYAL_GARDENS Area_Royal_Gardens
    [INFO]:[UExplorer] - [Explorer] DEEPNEST Area_Deepnest
    [INFO]:[UExplorer] - [Explorer] MINES Area_Crystal_Mines
    [INFO]:[UExplorer] - [Explorer] WASTES Area_Fungal_Wastes
    [INFO]:[UExplorer] - [Explorer] CITY Area_Art_City_of_Tears
    [INFO]:[UExplorer] - [Explorer] DREAM_WORLD Area_Dream_Well
    [INFO]:[UExplorer] - [Explorer] PALACE_GROUNDS Area_Palace_Grounds
    [INFO]:[UExplorer] - [Explorer] ROYAL_QUARTER Area_Royal_Quarter
    [INFO]:[UExplorer] - [Explorer] ABYSS Area_Abyss
    [INFO]:[UExplorer] - [Explorer] CLIFFS Area_Cliffs
    [INFO]:[UExplorer] - [Explorer] WHITE_PALACE Area_White_Palace
    [INFO]:[UExplorer] - [Explorer] KINGS_PASS Area_Kings_Pass
    [INFO]:[UExplorer] - [Explorer] SOUL_SOCIETY Area_Mage_Tower
    [INFO]:[UExplorer] - [Explorer] KINGS_STATION Area_Kings_Station
    [INFO]:[UExplorer] - [Explorer] TRAM_UPPER Area_Tram
    [INFO]:[UExplorer] - [Explorer] TRAM_LOWER Area_Tram_Lower
    [INFO]:[UExplorer] - [Explorer] OUTSKIRTS Area_Kingdoms_Edge
    [INFO]:[UExplorer] - [Explorer] SHAMAN_TEMPLE Area_Shaman_Temple
    [INFO]:[UExplorer] - [Explorer] QUEENS_STATION Area_Queen_Station
    [INFO]:[UExplorer] - [Explorer] HIVE Area_Hive
    [INFO]:[UExplorer] - [Explorer] FINAL_BOSS Area_Black_Egg
    [INFO]:[UExplorer] - [Explorer] COLOSSEUM Area_Colosseum
    [INFO]:[UExplorer] - [Explorer] RESTING_GROUNDS Area_Resting_Grounds
    [INFO]:[UExplorer] - [Explorer] MANTIS_VILLAGE Area_Art_Mantis_Village
    [INFO]:[UExplorer] - [Explorer] LURIENS_TOWER Area_Lurian_Tower
    [INFO]:[UExplorer] - [Explorer] BEASTS_DEN Area_Garz_Den
    [INFO]:[UExplorer] - [Explorer] MONOMON_ARCHIVE Area_Teacher_archive
    [INFO]:[UExplorer] - [Explorer] WATERWAYS Area_Waterways
    [INFO]:[UExplorer] - [Explorer] GODS_GLORY Area_Art_Godshome
    [INFO]:[UExplorer] - [Explorer] GODSEEKER_WASTE Area_Art_Junk_Pit
 */

// const area = '/ingame-sprites/areas/inv_item__0006_area_map.png';
const areaAbyss = '/ingame-sprites/areas/Area_Abyss.png';
const areaCityOfTears = '/ingame-sprites/areas/Area_Art_City_of_Tears.png';
const areaGodhome = '/ingame-sprites/areas/Area_Art_Godshome.png';
const areaJunkPit = '/ingame-sprites/areas/Area_Art_Junk_Pit.png';
const areaMantisVillage = '/ingame-sprites/areas/Area_Art_Mantis_Village.png';
const areaBlackEgg = '/ingame-sprites/areas/Area_Black_Egg.png';
const areaCliffs = '/ingame-sprites/areas/Area_Cliffs.png';
const areaColosseum = '/ingame-sprites/areas/Area_Colosseum.png';
const areaCrystalMines = '/ingame-sprites/areas/Area_Crystal_Mines.png';
const areaDeepnest = '/ingame-sprites/areas/Area_Deepnest.png';
const areaDirtmouth = '/ingame-sprites/areas/Area_Dirtmouth.png';
const areaDreamWell = '/ingame-sprites/areas/Area_Dream_Well.png';
const areaForgottenCrossroads = '/ingame-sprites/areas/Area_Forgotten Crossroads.png';
const areaFungalWastes = '/ingame-sprites/areas/Area_Fungal_Wastes.png';
const areaGarzDen = '/ingame-sprites/areas/Area_Garz_Den.png';
const areaGreenPath = '/ingame-sprites/areas/Area_Green_Path.png';
const areaHive = '/ingame-sprites/areas/Area_Hive.png';
const areaKingdomsEdge = '/ingame-sprites/areas/Area_Kingdoms_Edge.png';
const areaKingsPass = '/ingame-sprites/areas/Area_Kings_Pass.png';
const areaKingsStation = '/ingame-sprites/areas/Area_Kings_Station.png';
const areaLurianTower = '/ingame-sprites/areas/Area_Lurian_Tower.png';
const areaMageTower = '/ingame-sprites/areas/Area_Mage_Tower.png';
const areaPalaceGrounds = '/ingame-sprites/areas/Area_Palace_Grounds.png';
const areaQueensStation = '/ingame-sprites/areas/Area_Queen_Station.png';
const areaRestingGrounds = '/ingame-sprites/areas/Area_Resting_Grounds.png';
const areaRoyalGardens = '/ingame-sprites/areas/Area_Royal_Gardens.png';
const areaRoyalQuarter = '/ingame-sprites/areas/Area_Royal_Quarter.png';
const areaShamanTemple = '/ingame-sprites/areas/Area_Shaman_Temple.png';
const areaSoulSociety = '/ingame-sprites/areas/Area_Soul Society.png';
const areaTeachersArchive = '/ingame-sprites/areas/Area_Teacher_archive.png';
const areaTram = '/ingame-sprites/areas/Area_Tram.png';
const areaTramLower = '/ingame-sprites/areas/Area_Tram_Lower.png';
const areaWaterways = '/ingame-sprites/areas/Area_Waterways.png';
const areaWhitePalace = '/ingame-sprites/areas/Area_White_Palace.png';

export function getMapZoneHudBackground(zone: MapZone | undefined | null) {
    switch (zone) {
        case 'NONE':
        case null:
        case undefined:
            return areaDirtmouth; // not defined in game
        case 'TEST_AREA':
            return areaDirtmouth; // not defined in game
        case 'KINGS_PASS':
            return areaKingsPass;
        case 'CLIFFS':
            return areaCliffs;
        case 'TOWN':
            return areaDirtmouth;
        case 'CROSSROADS':
            return areaForgottenCrossroads;
        case 'GREEN_PATH':
            return areaGreenPath;
        case 'ROYAL_GARDENS':
            return areaRoyalGardens;
        case 'FOG_CANYON':
            return areaQueensStation;
        case 'WASTES':
            return areaFungalWastes;
        case 'DEEPNEST':
            return areaDeepnest;
        case 'HIVE':
            return areaHive;
        case 'BONE_FOREST':
            return areaDeepnest; // not defined in game
        case 'PALACE_GROUNDS':
            return areaPalaceGrounds;
        case 'MINES':
            return areaCrystalMines;
        case 'RESTING_GROUNDS':
            return areaRestingGrounds;
        case 'CITY':
            return areaCityOfTears;
        case 'DREAM_WORLD':
            return areaDreamWell;
        case 'COLOSSEUM':
            return areaColosseum;
        case 'ABYSS':
            return areaAbyss;
        case 'ROYAL_QUARTER':
            return areaRoyalQuarter;
        case 'WHITE_PALACE':
            return areaWhitePalace;
        case 'SHAMAN_TEMPLE':
            return areaShamanTemple;
        case 'WATERWAYS':
            return areaWaterways;
        case 'QUEENS_STATION':
            return areaQueensStation;
        case 'OUTSKIRTS':
            return areaKingdomsEdge;
        case 'KINGS_STATION':
            return areaKingsStation;
        case 'MAGE_TOWER':
            return areaMageTower;
        case 'TRAM_UPPER':
            return areaTram;
        case 'TRAM_LOWER':
            return areaTramLower;
        case 'FINAL_BOSS':
            return areaBlackEgg;
        case 'SOUL_SOCIETY':
            return areaSoulSociety;
        case 'ACID_LAKE':
            return areaWaterways; // not defined in game
        case 'NOEYES_TEMPLE':
            return areaGreenPath; // not defined in game
        case 'MONOMON_ARCHIVE':
            return areaTeachersArchive;
        case 'MANTIS_VILLAGE':
            return areaMantisVillage;
        case 'RUINED_TRAMWAY':
            return areaDeepnest; // not defined in game
        case 'DISTANT_VILLAGE':
            return areaDeepnest; // not defined in game
        case 'ABYSS_DEEP':
            return areaAbyss; // not defined in game
        case 'ISMAS_GROVE':
            return areaWaterways; // not defined in game
        case 'WYRMSKIN':
            return areaKingdomsEdge; // not defined in game
        case 'LURIENS_TOWER':
            return areaLurianTower;
        case 'LOVE_TOWER':
            return areaKingdomsEdge; // not defined in game
        case 'GLADE':
            return areaRestingGrounds;
        case 'BLUE_LAKE':
            return areaRestingGrounds; // not defined in game
        case 'PEAK':
            return areaCrystalMines; // not defined in game
        case 'JONI_GRAVE':
            return areaCliffs; // not defined in game
        case 'OVERGROWN_MOUND':
            return areaRoyalGardens; // not defined in game
        case 'CRYSTAL_MOUND':
            return areaCrystalMines; // not defined in game
        case 'BEASTS_DEN':
            return areaGarzDen;
        case 'GODS_GLORY':
            return areaGodhome;
        case 'GODSEEKER_WASTE':
            return areaJunkPit;
        default:
            assertNever(zone);
    }
}
