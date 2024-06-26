import { Card, CardContent, CardHeader } from '@hkviz/components';
import { recordingSplitGroups } from '@hkviz/parser';
import { splitColors } from '@hkviz/viz';
import { Li, Ul } from '@hkviz/viz-ui';
import { For } from 'solid-js';

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
