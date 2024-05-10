import { type AggregationVariable } from '@hkviz/viz';
import { Clock12, Clock2, Hash, type LucideIcon } from 'lucide-solid';
import { coinImg, focusImg, healthImg, shadeImg, spellDownImg, spellFireballImg, spellUpImg } from '../img-urls';
import { render } from 'solid-js/web';

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
} satisfies Record<AggregationVariable, { Icon: LucideIcon } | { image: string }>;

export function AggregationVariableIcon({ variable }: { variable: AggregationVariable }) {
    const displayInfos = aggregationVariableDisplayInfos[variable];

    if ('image' in displayInfos) {
        return <img class="w-6" src={displayInfos.image} alt={'Aggregation Variable icon'} aria-hidden={true} />;
    } else if ('Icon' in displayInfos) {
        const Icon = displayInfos.Icon;
        return <Icon class="h-5 w-5" />;
    } else {
        return null;
    }
}

export function renderAggregationVariableIcon(variable: AggregationVariable, container: HTMLElement) {
    return render(() => <AggregationVariableIcon variable={variable} />, container);
}
