import { type AggregationVariable } from '@hkviz/viz';
import Image from 'next/image';
import { aggregationVariableDisplayInfos } from '~/lib/stores/aggregation-store';

export function AggregationVariableIcon({ variable }: { variable: AggregationVariable }) {
    const displayInfos = aggregationVariableDisplayInfos[variable];

    if ('image' in displayInfos) {
        return (
            <Image
                className="w-6"
                src={displayInfos.image}
                alt={'Aggregation Variable icon'}
                aria-hidden={true}
            ></Image>
        );
    } else if ('Icon' in displayInfos) {
        const Icon = displayInfos.Icon;
        return <Icon className="h-5 w-5" />;
    } else {
        return null;
    }
}
