import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Li, Ul } from '~/app/_components/list';
import { recordingSplitGroups } from '~/lib/viz/recording-files/recording-splits';

export function SplitsList() {
    return (
        <div className="not-prose block md:flex">
            <Card>
                <CardHeader className="pb-2 pt-2">
                    <b>Split types</b>
                </CardHeader>
                <CardContent>
                    <Ul>
                        {recordingSplitGroups.map((group) => (
                            <Li key={group.name} color={group.color}>
                                <b>{group.displayName}</b>
                                <br />
                                <span>{group.description}</span>
                            </Li>
                        ))}
                    </Ul>
                </CardContent>
            </Card>
        </div>
    );
}
