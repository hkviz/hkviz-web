import { type FrameEndEvent, type FrameEndEventNumberKey } from '@hkviz/parser';

export function downScale(data: FrameEndEvent[], fields: FrameEndEventNumberKey[], maxTimeDelta = 10000) {
    console.log('Original length', data.length, fields);

    let previous: FrameEndEvent | undefined = undefined;
    let current: FrameEndEvent | undefined = undefined;
    let next: FrameEndEvent | undefined = data[0];

    const filtered = [];
    let lastIncluded: FrameEndEvent | undefined = undefined;

    for (let i = 0; i < data.length; i++) {
        previous = current;
        current = next!;
        next = i + 1 < data.length ? data[i + 1] : undefined;

        if (!previous || !next) {
            filtered.push(current);
            lastIncluded = current;
            continue;
        }

        let didAnyChange = false;
        let isAnyExtrema = false;

        for (const field of fields) {
            if (current[field] !== previous[field]) {
                didAnyChange = true;
            }

            const previousValue = previous[field];
            const currentValue = current[field];
            const nextValue = next[field];

            isAnyExtrema ||=
                (currentValue < previousValue && currentValue <= nextValue) ||
                (currentValue <= previousValue && currentValue < nextValue) ||
                (currentValue > previousValue && currentValue >= nextValue) ||
                (currentValue >= previousValue && currentValue > nextValue);

            if (isAnyExtrema && didAnyChange) {
                break;
            }
        }

        if ((current.msIntoGame - lastIncluded!.msIntoGame > maxTimeDelta || isAnyExtrema) && didAnyChange) {
            filtered.push(current);
            lastIncluded = current;
        }
    }
    console.log('filtered length', filtered.length);
    return filtered;
}
