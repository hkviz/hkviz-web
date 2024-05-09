export type CodesOf<T extends readonly { code: unknown }[]> = {
    [I in keyof T]: T[I]['code'];
};
