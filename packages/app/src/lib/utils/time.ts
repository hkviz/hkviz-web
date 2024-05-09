import { zeroPad } from '@hkviz/parser';

export function formatTimeMs(ms: number): string {
    const isNegative = ms < 0;
    if (isNegative) {
        ms = -ms;
    }
    const hours = Math.floor(ms / 1000 / 60 / 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    // const deciSeconds = Math.floor(Math.floor(ms % 1000) / 100);

    let str = `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
    if (hours) {
        str = `${hours}:${str}`;
    }
    if (isNegative) {
        str = `-${str}`;
    }
    return str;
}

if (typeof window !== 'undefined') {
    (window as any).formatTimeMs = formatTimeMs;
}
