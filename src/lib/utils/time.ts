import { zeroPad } from '~/lib/utils/utils';

export function formatTimeMs(ms: number): string {
    const hours = Math.floor(ms / 1000 / 60 / 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    // const deciSeconds = Math.floor(Math.floor(ms % 1000) / 100);

    let str = `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
    if (hours) {
        str = `${hours}:${str}`;
    }
    return str;
}
