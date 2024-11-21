const GameStateShortNameToGameState = {
    i: 'INACTIVE',
    m: 'MAIN_MENU',
    l: 'LOADING',
    e: 'ENTERING_LEVEL',
    p: 'PLAYING',
    a: 'PAUSED',
    x: 'EXITING_LEVEL',
    c: 'CUTSCENE',
    r: 'PRIMER',
} as const;

export type GameStateShortName = keyof typeof GameStateShortNameToGameState;
export type GameState = (typeof GameStateShortNameToGameState)[GameStateShortName];

export function gameStateFromShortName(shortName: GameStateShortName): GameState {
    return GameStateShortNameToGameState[shortName];
}
