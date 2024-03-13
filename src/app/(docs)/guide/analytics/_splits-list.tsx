import { recordingSplitGroups } from '~/lib/viz/recording-files/recording-splits';

export function SplitsList() {
    return (
        <ul>
            {recordingSplitGroups.map((group) => (
                <li
                    key={group.name}
                    className={'marker:text marker:translate-x-3 marker:text-3xl marker:leading-none ' + group.color.li}
                >
                    <b>{group.displayName}</b>
                    <br />
                    <span>{group.description}</span>
                </li>
            ))}
        </ul>
    );
}
