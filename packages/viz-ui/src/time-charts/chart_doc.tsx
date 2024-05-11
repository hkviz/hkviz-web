import { Card, CardContent, CardHeader } from '@hkviz/components';
import { For, type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Li, Ul } from '../list';
import { type LineChartVariableDescription } from './line-area-chart';

export const ChartDocVars: Component<{ variables: LineChartVariableDescription[] }> = (props) => {
    return (
        <div class="not-prose block md:flex">
            <Card>
                <CardHeader class="pb-2 pt-2">
                    <b>Variables</b>
                </CardHeader>
                <CardContent>
                    <Ul>
                        <For each={props.variables}>
                            {(it) => (
                                <Li color={it.color}>
                                    <b>{it.name}</b>
                                    <br />
                                    <span>{it.description}</span>
                                </Li>
                            )}
                        </For>
                    </Ul>
                </CardContent>
            </Card>
        </div>
    );
};

export const ChartDocTitleIcon: Component<{ unit: Component<{ class?: string }> }> = (props) => {
    return <Dynamic component={props.unit} class="m-0 mr-1 inline-block w-[1.25em]" />;
};
