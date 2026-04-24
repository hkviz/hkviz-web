import { For } from 'solid-js';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { splitGroupsArrayHollow } from '~/lib/splits/splits-hollow/split-group-hollow';
import { Li, Ul } from '~/lib/viz';

export function SplitsListCard() {
	return (
		<div class="not-prose block md:flex">
			<Card>
				<SplitsList />
			</Card>
		</div>
	);
}

export function SplitsList() {
	return (
		<>
			<CardHeader class="pt-2 pb-2">
				<b>Split types</b>
			</CardHeader>
			<CardContent>
				<Ul>
					<For each={splitGroupsArrayHollow}>
						{(group) => (
							<Li color={group.color}>
								<b>{group.displayName}</b>
								<br />
								<span>{group.description}</span>
							</Li>
						)}
					</For>
				</Ul>
			</CardContent>
		</>
	);
}
