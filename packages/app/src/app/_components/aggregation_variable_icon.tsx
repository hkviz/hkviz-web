import Image from 'next/image';
import { type AggregationVariable, type aggregationVariableInfos } from '~/lib/stores/aggregation-store';

export function AggregationVariableIcon({
    variable,
}: {
    variable: (typeof aggregationVariableInfos)[AggregationVariable];
}) {
    if ('image' in variable) {
        return (
            <Image className="w-6" src={variable.image} alt={'Aggregation Variable icon'} aria-hidden={true}></Image>
        );
    } else if ('Icon' in variable) {
        const Icon = variable.Icon;
        return <Icon className="h-5 w-5" />;
    } else {
        return null;
    }
}
