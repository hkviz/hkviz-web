import { langMapZones } from '../hk-data';
import { langTitles } from '../hk-data';

export type LanguageSheetHK = 'Titles' | 'Map Zones';
export type LanguageKeyOfSheet<T extends string> = T extends 'Titles'
    ? keyof typeof langTitles
    : T extends 'Map Zones'
      ? keyof typeof langMapZones
      : never;

export function hkLangString<TSheet extends LanguageSheetHK>(sheet: TSheet, key: LanguageKeyOfSheet<TSheet>) {
    switch (sheet) {
        case 'Titles':
            return langTitles[key as keyof typeof langTitles];
        case 'Map Zones':
            return langMapZones[key as keyof typeof langMapZones];
        default:
            return undefined;
    }
}
