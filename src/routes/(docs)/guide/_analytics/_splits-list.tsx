import { For } from 'solid-js';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { recordingSplitGroups } from '~/lib/parser/recording-files/parser-hollow/recording-splits';
import { Li, splitColors, Ul } from '~/lib/viz';

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
					<For each={recordingSplitGroups}>
						{(group) => (
							<Li color={splitColors[group.name]}>
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
