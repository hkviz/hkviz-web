import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Li, Ul } from '~/app/_components/list';
import { type LineChartVariableDescription } from './line-area-chart';

export function ChartDocVars({ variables }: { variables: LineChartVariableDescription[] }) {
    return (
        <div className="not-prose block md:flex">
            <Card>
                <CardHeader className="pb-2 pt-2">
                    <b>Variables</b>
                </CardHeader>
                <CardContent>
                    <Ul>
                        {variables.map((it) => (
                            <Li key={it.key} color={it.color}>
                                <b>{it.name}</b>
                                <br />
                                <span>{it.description}</span>
                            </Li>
                        ))}
                    </Ul>
                </CardContent>
            </Card>
        </div>
    );
}

export function ChartDocTitleIcon({ unit: Unit }: { unit: React.FunctionComponent<{ className?: string }> }) {
    return <Unit className="m-0 mr-1 inline-block w-[1.25em]" />;
}
