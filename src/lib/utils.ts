export function raise(e: Error): never {
    throw e;
}

export function assertNever(x: never): never {
    throw new Error(`Unexpected value: ${x as unknown as string}`);
}

export function typeCheckNever(_: never): void {
    return;
}

export function zeroPad(num: number, places: number) {
    return String(num).padStart(places, '0');
}
