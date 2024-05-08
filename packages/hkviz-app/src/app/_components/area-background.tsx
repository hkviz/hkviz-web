import { assertNever } from '~/lib/utils/utils';
import { type MapZone } from '@hkviz/parser';

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

// import Area from '../../../public/ingame-sprites/areas/inv_item__0006_area_map.png';
import AreaAbyss from '../../../public/ingame-sprites/areas/Area_Abyss.png';
import AreaCityOfTears from '../../../public/ingame-sprites/areas/Area_Art_City_of_Tears.png';
import AreaGodhome from '../../../public/ingame-sprites/areas/Area_Art_Godshome.png';
import AreaJunkPit from '../../../public/ingame-sprites/areas/Area_Art_Junk_Pit.png';
import AreaMantisVillage from '../../../public/ingame-sprites/areas/Area_Art_Mantis_Village.png';
import AreaBlackEgg from '../../../public/ingame-sprites/areas/Area_Black_Egg.png';
import AreaCliffs from '../../../public/ingame-sprites/areas/Area_Cliffs.png';
import AreaColosseum from '../../../public/ingame-sprites/areas/Area_Colosseum.png';
import AreaCrystalMines from '../../../public/ingame-sprites/areas/Area_Crystal_Mines.png';
import AreaDeepnest from '../../../public/ingame-sprites/areas/Area_Deepnest.png';
import AreaDirtmouth from '../../../public/ingame-sprites/areas/Area_Dirtmouth.png';
import AreaDreamWell from '../../../public/ingame-sprites/areas/Area_Dream_Well.png';
import AreaForgottenCrossroads from '../../../public/ingame-sprites/areas/Area_Forgotten Crossroads.png';
import AreaFungalWastes from '../../../public/ingame-sprites/areas/Area_Fungal_Wastes.png';
import AreaGarzDen from '../../../public/ingame-sprites/areas/Area_Garz_Den.png';
import AreaGreenPath from '../../../public/ingame-sprites/areas/Area_Green_Path.png';
import AreaHive from '../../../public/ingame-sprites/areas/Area_Hive.png';
import AreaKingdomsEdge from '../../../public/ingame-sprites/areas/Area_Kingdoms_Edge.png';
import AreaKingsPass from '../../../public/ingame-sprites/areas/Area_Kings_Pass.png';
import AreaKingsStation from '../../../public/ingame-sprites/areas/Area_Kings_Station.png';
import AreaLurianTower from '../../../public/ingame-sprites/areas/Area_Lurian_Tower.png';
import AreaMageTower from '../../../public/ingame-sprites/areas/Area_Mage_Tower.png';
import AreaPalaceGrounds from '../../../public/ingame-sprites/areas/Area_Palace_Grounds.png';
import AreaQueensStation from '../../../public/ingame-sprites/areas/Area_Queen_Station.png';
import AreaRestingGrounds from '../../../public/ingame-sprites/areas/Area_Resting_Grounds.png';
import AreaRoyalGardens from '../../../public/ingame-sprites/areas/Area_Royal_Gardens.png';
import AreaRoyalQuarter from '../../../public/ingame-sprites/areas/Area_Royal_Quarter.png';
import AreaShamanTemple from '../../../public/ingame-sprites/areas/Area_Shaman_Temple.png';
import AreaSoulSociety from '../../../public/ingame-sprites/areas/Area_Soul Society.png';
import AreaTeachersArchive from '../../../public/ingame-sprites/areas/Area_Teacher_archive.png';
import AreaTram from '../../../public/ingame-sprites/areas/Area_Tram.png';
import AreaTramLower from '../../../public/ingame-sprites/areas/Area_Tram_Lower.png';
import AreaWaterways from '../../../public/ingame-sprites/areas/Area_Waterways.png';
import AreaWhitePalace from '../../../public/ingame-sprites/areas/Area_White_Palace.png';

export function getMapZoneHudBackground(zone: MapZone | undefined | null) {
    switch (zone) {
        case 'NONE':
        case null:
        case undefined:
            return AreaDirtmouth; // not defined in game
        case 'TEST_AREA':
            return AreaDirtmouth; // not defined in game
        case 'KINGS_PASS':
            return AreaKingsPass;
        case 'CLIFFS':
            return AreaCliffs;
        case 'TOWN':
            return AreaDirtmouth;
        case 'CROSSROADS':
            return AreaForgottenCrossroads;
        case 'GREEN_PATH':
            return AreaGreenPath;
        case 'ROYAL_GARDENS':
            return AreaRoyalGardens;
        case 'FOG_CANYON':
            return AreaQueensStation;
        case 'WASTES':
            return AreaFungalWastes;
        case 'DEEPNEST':
            return AreaDeepnest;
        case 'HIVE':
            return AreaHive;
        case 'BONE_FOREST':
            return AreaDeepnest; // not defined in game
        case 'PALACE_GROUNDS':
            return AreaPalaceGrounds;
        case 'MINES':
            return AreaCrystalMines;
        case 'RESTING_GROUNDS':
            return AreaRestingGrounds;
        case 'CITY':
            return AreaCityOfTears;
        case 'DREAM_WORLD':
            return AreaDreamWell;
        case 'COLOSSEUM':
            return AreaColosseum;
        case 'ABYSS':
            return AreaAbyss;
        case 'ROYAL_QUARTER':
            return AreaRoyalQuarter;
        case 'WHITE_PALACE':
            return AreaWhitePalace;
        case 'SHAMAN_TEMPLE':
            return AreaShamanTemple;
        case 'WATERWAYS':
            return AreaWaterways;
        case 'QUEENS_STATION':
            return AreaQueensStation;
        case 'OUTSKIRTS':
            return AreaKingdomsEdge;
        case 'KINGS_STATION':
            return AreaKingsStation;
        case 'MAGE_TOWER':
            return AreaMageTower;
        case 'TRAM_UPPER':
            return AreaTram;
        case 'TRAM_LOWER':
            return AreaTramLower;
        case 'FINAL_BOSS':
            return AreaBlackEgg;
        case 'SOUL_SOCIETY':
            return AreaSoulSociety;
        case 'ACID_LAKE':
            return AreaWaterways; // not defined in game
        case 'NOEYES_TEMPLE':
            return AreaGreenPath; // not defined in game
        case 'MONOMON_ARCHIVE':
            return AreaTeachersArchive;
        case 'MANTIS_VILLAGE':
            return AreaMantisVillage;
        case 'RUINED_TRAMWAY':
            return AreaDeepnest; // not defined in game
        case 'DISTANT_VILLAGE':
            return AreaDeepnest; // not defined in game
        case 'ABYSS_DEEP':
            return AreaAbyss; // not defined in game
        case 'ISMAS_GROVE':
            return AreaWaterways; // not defined in game
        case 'WYRMSKIN':
            return AreaKingdomsEdge; // not defined in game
        case 'LURIENS_TOWER':
            return AreaLurianTower;
        case 'LOVE_TOWER':
            return AreaKingdomsEdge; // not defined in game
        case 'GLADE':
            return AreaRestingGrounds;
        case 'BLUE_LAKE':
            return AreaRestingGrounds; // not defined in game
        case 'PEAK':
            return AreaCrystalMines; // not defined in game
        case 'JONI_GRAVE':
            return AreaCliffs; // not defined in game
        case 'OVERGROWN_MOUND':
            return AreaRoyalGardens; // not defined in game
        case 'CRYSTAL_MOUND':
            return AreaCrystalMines; // not defined in game
        case 'BEASTS_DEN':
            return AreaGarzDen;
        case 'GODS_GLORY':
            return AreaGodhome;
        case 'GODSEEKER_WASTE':
            return AreaJunkPit;
        default:
            assertNever(zone);
    }
}
