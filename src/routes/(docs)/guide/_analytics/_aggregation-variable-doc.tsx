import { For } from 'solid-js';
import { Card } from '~/components/ui/card';
import { AggregationVariableIcon } from '~/lib/viz';
import { AggregationVariable, aggregationVariableInfos } from '~/lib/viz/store/aggregations/aggregate-recording';

export function AggregationVariableDoc() {
	return (
		<div class="not-prose">
			<Card>
				<ul>
					<For each={Object.entries(aggregationVariableInfos)}>
						{([key, it]) => (
							<li class="flex flex-row items-center justify-start gap-2 border-b p-1 pl-2 last:border-b-0">
								<span class="flex w-10 flex-row items-center justify-center">
									<AggregationVariableIcon variable={key as AggregationVariable} />
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
