export const recordingFileVersions = [
    /**
     * - writes hero state .transitioning
     * - writes info when HeroController.TakeDamage is called, aka. about how much damage, and who deals it
     * - writes info when PlayerData.TakeHealth is called, after hc.TakeDamage is called, which contains the final health value
     * - writes empty line at beginning, so unfinished files will not create problems for new entries.
     */
    '1.4.0',

    /**
     * (first version in mod list)
     * used by mod version 1.1.0, 1.2.0 and 1.3.0
     */
    '1.1.0',

    /**
     * (introduced before mod was published)
     * added logging of enemy health and creation
     * and changed format of position event
     * does not only contain player positions, but also enemy positions
     * logged in lower resolution, now logged as x*10;y*10 without decimal places it was logged as x;y with decimal places using local culture before
     */
    '1.0.0',

    /**
     * first version (introduced before mod was published)
     */
    '0.0.0',
] as const;

export type RecordingFileVersion = (typeof recordingFileVersions)[number];

export function isKnownRecordingFileVersion(version: string): version is RecordingFileVersion {
    return recordingFileVersions.includes(version as RecordingFileVersion);
}

export type RecordingFileVersion0xx = '0.0.0';
export function isVersion0xx(version: RecordingFileVersion): version is RecordingFileVersion0xx {
    return version === '0.0.0';
}

export type RecordingFileVersion1xx = '1.0.0' | '1.1.0' | '1.4.0';
export function isVersion1xx(version: RecordingFileVersion): version is RecordingFileVersion1xx {
    return version === '1.0.0' || version === '1.1.0' || version === '1.4.0';
}
