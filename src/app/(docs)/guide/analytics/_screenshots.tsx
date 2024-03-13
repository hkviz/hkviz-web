import { HKVizText } from '~/app/_components/hkviz-text';
import { ImageContainer, ThemedImage } from './_image_component';
import { ImageArea, ImageAreaShadow } from './_image_component_client';

import overviewDarkSrc from './screenshots/overview_dark.png';
import overviewLightSrc from './screenshots/overview_light.png';

import tracesAllDarkSrc from './screenshots/traces_all_dark.png';
import tracesAllLightSrc from './screenshots/traces_all_light.png';

import tracesAnimatedDarkSrc from './screenshots/traces_animated_dark.png';
import tracesAnimatedLightSrc from './screenshots/traces_animated_light.png';

import tracesNoneDarkSrc from './screenshots/traces_none_dark.png';
import tracesNoneLightSrc from './screenshots/traces_none_light.png';

import roomAnalyticsDarkSrc from './screenshots/room_analytics_dark.png';
import roomAnalyticsLightSrc from './screenshots/room_analytics_light.png';

import colorModeAreaDarkSrc from './screenshots/room_colors_area_dark.png';
import colorModeAreaDarkTableSrc from './screenshots/room_colors_area_dark_table.png';
import colorModeAreaLightSrc from './screenshots/room_colors_area_light.png';
import colorModeAreaLightTableSrc from './screenshots/room_colors_area_light_table.png';

import colorModeLinearDarkSrc from './screenshots/room_colors_linear_dark.png';
import colorModeLinearDarkTableSrc from './screenshots/room_colors_linear_dark_table.png';
import colorModeLinearLightSrc from './screenshots/room_colors_linear_light.png';
import colorModeLinearLightTableSrc from './screenshots/room_colors_linear_light_table.png';

import colorModeExpDarkSrc from './screenshots/room_colors_exp3_dark.png';
import colorModeExpDarkTableSrc from './screenshots/room_colors_exp3_dark_table.png';
import colorModeExpLightSrc from './screenshots/room_colors_exp3_light.png';
import colorModeExpLightTableSrc from './screenshots/room_colors_exp3_light_table.png';

export function OverviewScreenshot() {
    return (
        <ImageContainer
            caption={
                <>
                    <HKVizText /> gameplay analytics page
                </>
            }
        >
            <ImageAreaShadow>
                <ThemedImage
                    srcLight={overviewLightSrc}
                    srcDark={overviewDarkSrc}
                    className="m-0"
                    alt="HKViz gameplay analytics page"
                />
                {/* <ImageArea positionClassName="left-[1%] top-[9%] h-[32%] w-[28%]" href="#map-options">
                    Map options
                </ImageArea> */}
                <ImageArea positionClassName="left-[1%] top-[16%] h-[8%] w-[28%]" href="#room-visibility">
                    Room visibility
                </ImageArea>
                <ImageArea positionClassName="left-[1%] top-[24.5%] h-[8%] w-[28%]" href="#player-movement-and-traces">
                    Traces
                </ImageArea>
                <ImageArea positionClassName="left-[1%] top-[33%] h-[8%] w-[28%]" href="#map-coloring-by-variables">
                    Room colors
                </ImageArea>
                <ImageArea positionClassName="left-[1%] top-[42%] h-[57%] w-[28%]" href="#map-coloring-by-variables">
                    Room analytics
                </ImageArea>
                <ImageArea positionClassName="left-[30%] top-[9%] h-[83%] w-[38%]" href="#map">
                    Map
                </ImageArea>
                <ImageArea positionClassName="left-[30%] top-[93%] h-[6%] w-[38%]" href="#timeline">
                    Timeline
                </ImageArea>
                <ImageArea positionClassName="left-[68.5%] top-[9%] h-[90%] w-[31%]" href="#splits">
                    Splits
                </ImageArea>
                <ImageArea positionClassName="left-[82%] top-[9%] h-[8%] w-[10%]" href="#time-charts">
                    Time charts
                </ImageArea>
            </ImageAreaShadow>
        </ImageContainer>
    );
}

export function TracesAllScreenshot() {
    return (
        <ImageContainer>
            <ThemedImage
                srcLight={tracesAllLightSrc}
                srcDark={tracesAllDarkSrc}
                className="m-0"
                alt="Traces on game map showing all player movement within a gameplay in the Forgotten Crossroads area"
            />
        </ImageContainer>
    );
}

export function TracesAnimatedScreenshot() {
    return (
        <ImageContainer>
            <ThemedImage
                srcLight={tracesAnimatedLightSrc}
                srcDark={tracesAnimatedDarkSrc}
                className="m-0"
                alt="Traces on game map showing player movement of 4 minutes. The traces fade out, for positions further in the past in the Forgotten Crossroads area"
            />
        </ImageContainer>
    );
}

export function TracesNoneScreenshot() {
    return (
        <ImageContainer>
            <ThemedImage
                srcLight={tracesNoneLightSrc}
                srcDark={tracesNoneDarkSrc}
                className="m-0"
                alt="A game map showing rooms of Forgotten Crossroads with no traces on top, displaying player movement."
            />
        </ImageContainer>
    );
}

export function RoomAnalyticsScreenshot() {
    return (
        <ImageContainer
            className="max-w-48 md:float-right md:ml-4"
            caption={
                <>
                    <HKVizText /> Room analytics panel
                </>
            }
        >
            <ThemedImage
                srcLight={roomAnalyticsLightSrc}
                srcDark={roomAnalyticsDarkSrc}
                className="m-0"
                alt="A table showing various variables of a room selected on the map."
            />
        </ImageContainer>
    );
}

export function ColorModeAreaScreenshot() {
    return (
        <ImageContainer>
            <ThemedImage
                srcLight={colorModeAreaLightSrc}
                srcDark={colorModeAreaDarkSrc}
                className="m-0"
                alt="A map showing the area colors of the game rooms"
            />
        </ImageContainer>
    );
}

export function ColorModeAreaTableScreenshot() {
    return (
        <ImageContainer className="mb-2">
            <ThemedImage
                srcLight={colorModeAreaLightTableSrc}
                srcDark={colorModeAreaDarkTableSrc}
                className="m-0"
                alt="Variable table row showing area color mode selected"
            />
        </ImageContainer>
    );
}

export function ColorModeLinearScreenshot() {
    return (
        <ImageContainer>
            <ThemedImage
                srcLight={colorModeLinearLightSrc}
                srcDark={colorModeLinearDarkSrc}
                className="m-0"
                alt="A map showing rooms colored by the geo earned by area"
            />
        </ImageContainer>
    );
}

export function ColorModeLinearTableScreenshot() {
    return (
        <ImageContainer className="mb-2">
            <ThemedImage
                srcLight={colorModeLinearLightTableSrc}
                srcDark={colorModeLinearDarkTableSrc}
                className="m-0"
                alt="Variable table row showing linear color scale selected"
            />
        </ImageContainer>
    );
}

export function ColorModeExpScreenshot() {
    return (
        <ImageContainer>
            <ThemedImage
                srcLight={colorModeExpLightSrc}
                srcDark={colorModeExpDarkSrc}
                className="m-0"
                alt="A map showing rooms colored by the geo earned by area in an exponential scale"
            />
        </ImageContainer>
    );
}

export function ColorModeExpTableScreenshot() {
    return (
        <ImageContainer className="mb-2">
            <ThemedImage
                srcLight={colorModeExpLightTableSrc}
                srcDark={colorModeExpDarkTableSrc}
                className="m-0"
                alt="Variable table row showing exponential color scale selected"
            />
        </ImageContainer>
    );
}
