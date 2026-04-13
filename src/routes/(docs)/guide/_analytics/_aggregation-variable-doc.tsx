import { For } from 'solid-js';
import { Card } from '~/components/ui/card';
import { AggregationVariable } from '~/lib/aggregation/aggregation-variable';
import { aggregationVariableInfosHollow } from '~/lib/aggregation/aggregation-variable-info-hollow';
import { AggregationVariableIcon } from '~/lib/viz';

export function AggregationVariableDoc() {
	// TODO add Silk doc
	return (
		<div class="not-prose">
			<Card>
				<ul>
					<For each={Object.entries(aggregationVariableInfosHollow)}>
						{([key, it]) => (
							<li class="flex flex-row items-center justify-start gap-2 border-b p-1 pl-2 last:border-b-0">
								<span class="flex w-10 flex-row items-center justify-center">
									<AggregationVariableIcon variable={key as AggregationVariable} game="hollow" />
								</span>
								<span>
									<b>{it.name}:</b>
									<br />
									{it.description}
								</span>
							</li>
						)}
					</For>
				</ul>
			</Card>
		</div>
	);
}
