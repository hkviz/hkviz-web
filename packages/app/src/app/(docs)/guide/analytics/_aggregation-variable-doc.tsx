import { Card } from '@/components/ui/card';
import { aggregationVariableInfos } from '@hkviz/viz';
import { AggregationVariableIcon } from '~/app/_components/aggregation_variable_icon';

export function AggregationVariableDoc() {
    return (
        <div className="not-prose">
            <Card>
                <ul>
                    {Object.entries(aggregationVariableInfos).map(([key, it]) => (
                        <li
                            key={key}
                            className="flex flex-row items-center justify-start gap-2 border-b p-1 pl-2 last:border-b-0"
                        >
                            <span className="flex w-10 flex-row items-center justify-center">
                                <AggregationVariableIcon variable={key as any} />
                            </span>
                            <span>
                                <b>{it.name}:</b>
                                <br />
                                {it.description}
                            </span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
