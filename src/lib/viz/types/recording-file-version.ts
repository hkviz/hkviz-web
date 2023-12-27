export const recordingFileVersions = [
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
