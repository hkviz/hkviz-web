import { type AggregationVariable } from '@hkviz/viz';
import { Clock12, Clock2, Hash, type LucideIcon } from 'lucide-solid';
import { Match, Switch } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { coinImg, focusImg, maskImg, shadeImg, spellDownImg, spellFireballImg, spellUpImg } from '../img-urls';

export const aggregationVariableDisplayInfos: Record<AggregationVariable, { Icon?: LucideIcon; image?: string }> = {
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
        image: maskImg,
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
};

export function AggregationVariableIcon(props: { variable: AggregationVariable }) {
    const displayInfos = () => aggregationVariableDisplayInfos[props.variable];

    return (
        <Switch>
            <Match when={'image' in displayInfos() && displayInfos()}>
                {(displayInfos) => (
                    <img class="w-6" src={displayInfos().image} alt={'Aggregation Variable icon'} aria-hidden={true} />
                )}
            </Match>
            <Match when={'Icon' in displayInfos() && displayInfos()}>
                {(displayInfos) => <Dynamic component={displayInfos().Icon} class="h-5 w-5" />}
            </Match>
        </Switch>
    );
}
