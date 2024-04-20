export const runInteractionTypes = ['like'] as const;

export type RunInteractionType = (typeof runInteractionTypes)[number];
