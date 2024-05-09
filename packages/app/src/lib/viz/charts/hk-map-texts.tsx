import { areaNames, hkLangString, roomData, type AreaNameTextData } from '@hkviz/parser';
import { changeRoomColorForLightTheme } from '@hkviz/viz';
import { useSignalEffect } from '@preact/signals-react';
import { useMemo, useRef } from 'react';
import { roomColoringStore } from '~/lib/stores/room-coloring-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { themeStore } from '~/lib/stores/theme-store';
import { ebGaramond } from '~/styles/fonts';

function HkMapText({
    textData,
    visibleBy,
}: {
    textData: AreaNameTextData;
    visibleBy: { gameObjectName: string } | { zoneName: string };
}) {
    const textRef = useRef<SVGTextElement>(null);

    // color
    useSignalEffect(function hkMapTextColorEffect() {
        const colorMode = roomColoringStore.colorMode.valuePreact;
        const theme = themeStore.currentTheme.valuePreact;

        let fill: string;
        if (theme === 'light') {
            fill = colorMode === 'area' ? changeRoomColorForLightTheme(textData.color) : 'rgba(0,0,0,0.8)';
        } else {
            fill = colorMode === 'area' ? textData.color.formatHex() : 'rgba(255,255,255,0.8)';
        }
        textRef.current!.style.fill = fill;
    });

    // opacity
    useSignalEffect(function hkMapTextOpacityEffect() {
        const typeVisible =
            textData.type === 'area'
                ? roomDisplayStore.showAreaNames.valuePreact
                : roomDisplayStore.showSubAreaNames.valuePreact;

        const visible =
            typeVisible &&
            ('gameObjectName' in visibleBy
                ? roomDisplayStore.statesByGameObjectName.get(visibleBy.gameObjectName)!.isVisible.value
                : roomDisplayStore.zoneVisible.get(visibleBy.zoneName)!.value);
        textRef.current!.style.opacity = visible ? '1' : '0';
    });

    return (
        <text
            ref={textRef}
            className={
                'area-name-shadow pointer-events-none drop-shadow-md ' +
                (textData.type === 'area' ? 'font-serif' : ebGaramond.className)
            }
            textAnchor="middle"
            dominantBaseline="central"
            x={textData.bounds.center.x}
            y={textData.bounds.center.y}
            style={{ fontSize: 3.25, transition: 'opacity 0.1s ease 0s', fill: 'rgb(181, 220, 251)' }}
        >
            {hkLangString(textData.sheetName as any, textData.convoName) ?? textData.convoName}
        </text>
    );
}

export function HkMapTexts() {
    const roomTexts = useMemo(
        () =>
            roomData.flatMap((room) =>
                room.texts.filter((text) => !text.objectPath.includes('Next Area')).map((text) => ({ room, text })),
            ),
        [],
    );

    return (
        <g data-group="area-names">
            {roomTexts.map((it) => (
                <HkMapText
                    key={it.room.gameObjectName + it.text.convoName}
                    textData={it.text}
                    visibleBy={{
                        gameObjectName: it.room.gameObjectNameNeededInVisited,
                    }}
                />
            ))}
            {areaNames.map((text) => (
                <HkMapText
                    key={text.convoName}
                    textData={text}
                    visibleBy={{
                        zoneName: text.convoName,
                    }}
                />
            ))}
        </g>
    );
}
