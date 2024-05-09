import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { recordingSplitGroups } from '@hkviz/parser';
import { splitColors } from '@hkviz/viz';
import { Li, Ul } from '~/app/_components/list';

export function SplitsList() {
    return (
        <div className="not-prose block md:flex">
            <Card>
                <CardHeader className="pb-2 pt-2">
                    <b>Split types</b>
                </CardHeader>
                <CardContent>
                    <Ul>
                        {recordingSplitGroups.map((group) => {
                            const color = splitColors[group.name];
                            return (
                                <Li key={group.name} color={color}>
                                    <b>{group.displayName}</b>
                                    <br />
                                    <span>{group.description}</span>
                                </Li>
                            );
                        })}
                    </Ul>
                </CardContent>
            </Card>
        </div>
    );
}
