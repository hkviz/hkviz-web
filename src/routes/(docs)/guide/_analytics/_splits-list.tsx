import { For } from 'solid-js';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { recordingSplitGroups } from '~/lib/parser';
import { Li, splitColors, Ul } from '~/lib/viz';

export function SplitsList() {
	return (
		<div class="not-prose block md:flex">
			<Card>
				<CardHeader class="pb-2 pt-2">
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
			</Card>
		</div>
	);
}
