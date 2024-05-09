import { aggregateRecording, aggregationStore as aggregationStoreSolid, type AggregationVariable } from '@hkviz/viz';
import { computed } from '@preact/signals-react';
import { Clock12, Clock2, Hash, type LucideIcon } from 'lucide-react';
import coinImg from '../../../public/ingame-sprites/HUD_coin_shop.png';
import shadeImg from '../../../public/ingame-sprites/bestiary/bestiary_hollow-shade_s.png';
import spellUpImg from '../../../public/ingame-sprites/inventory/Inv_0024_spell_scream_01.png';
import spellFireballImg from '../../../public/ingame-sprites/inventory/Inv_0025_spell_fireball_01.png';
import spellDownImg from '../../../public/ingame-sprites/inventory/Inv_0026_spell_quake_01.png';
import focusImg from '../../../public/ingame-sprites/inventory/Inv_0029_spell_core.png';
import healthImg from '../../../public/ingame-sprites/select_game_HUD_0001_health.png';
import { gameplayStore } from './gameplay-store';

export const aggregationVariableDisplayInfos = {
    visits: {
        Icon: Hash,
    },
    firstVisitMs: {
        Icon: Clock12,
    },
    timeSpendMs: {
        Icon: Clock2,
    },
    damageTaken: {
        image: healthImg,
    },
    deaths: {
        image: shadeImg,
    },
    focusing: {
        image: focusImg,
    },
    spellFireball: {
        image: spellFireballImg,
    },
    spellDown: {
        image: spellDownImg,
    },
    spellUp: {
        image: spellUpImg,
    },
    geoEarned: {
        image: coinImg,
    },
    geoSpent: {
        image: coinImg,
    },
} satisfies Record<AggregationVariable, { Icon: LucideIcon } | { image: typeof coinImg }>;

const aggregations = computed(() => {
    const recording = gameplayStore.recording.valuePreact;
    if (!recording) return null;
    return aggregateRecording(recording);
});

export const aggregationStore = {
    ...aggregationStoreSolid,
    data: aggregations,
};
