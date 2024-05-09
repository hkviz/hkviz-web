import { roomDataUnscaled, roomDataUnscaledFinishedGame } from '@hkviz/hk-data';

export function logPossibleConditionals() {
    const conditionalOn: Record<string, string> = {
        Town: 'Mines_10',
        Deepnest_03: 'Deepnest_31',
        Deepnest_01: 'Deepnest_01b',
        Deepnest_East_01: 'Hive_03_c',
    };

    console.log(
        Object.fromEntries(
            roomDataUnscaledFinishedGame.rooms
                .filter((finishedRoom) => {
                    const unfinishedRoom = roomDataUnscaled.rooms.find(
                        (it) => it.gameObjectName === finishedRoom.gameObjectName,
                    );

                    // since the finished generated was generated with a finished game map, the rough sprite is actually the last sprite
                    const conditionalSpriteInfo = finishedRoom.roughSpriteInfo ?? finishedRoom.spriteInfo;

                    return unfinishedRoom?.spriteInfo.name !== conditionalSpriteInfo?.name;
                })
                .map((finishedRoom) => {
                    const conditionalSpriteInfo = finishedRoom.roughSpriteInfo ?? finishedRoom.spriteInfo;
                    return [
                        finishedRoom.gameObjectName,
                        { conditionalOn: conditionalOn[finishedRoom.gameObjectName], ...conditionalSpriteInfo },
                    ];
                }),
        ),
    );
}
