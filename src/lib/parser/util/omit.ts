export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const o: Omit<T, K> & Partial<Pick<T, K>> = { ...obj };
    for (const key of keys) {
        delete o[key];
    }
    return o;
}
