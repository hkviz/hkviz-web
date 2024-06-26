export const MAX_RUN_TITLE_LENGTH = 64;

export function cleanupTitle(title: string, inEdit = false) {
    const cleaned = title.replace(/\s+/g, ' ').slice(0, MAX_RUN_TITLE_LENGTH);

    // only trim at save, since otherwise spaces can not be entered
    return inEdit ? cleaned : cleaned.trim();
}
