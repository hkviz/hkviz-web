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

import godhomeDarkSrc from './screenshots/godhome_dark.png';
import godhomeLightSrc from './screenshots/godhome_light.png';

import colosseumDarkSrc from './screenshots/colluseum_dark.png';
import colosseumLightSrc from './screenshots/colluseum_light.png';

import timelineDarkSrc from './screenshots/timeline_dark.png';
import timelineLightSrc from './screenshots/timeline_light.png';

import splitsDarkSrc from './screenshots/splits_dark.png';
import splitsLightSrc from './screenshots/splits_light.png';

import buildingsColormapDarkSrc from './screenshots/buildings_colormap_dark.png';
import buildingsColormapLightSrc from './screenshots/buildings_colormap_light.png';

import subroomsDarkSrc from './screenshots/subrooms_dark.png';
import subroomsLightSrc from './screenshots/subrooms_light.png';

import extraChartGeoDarkSrc from './screenshots/extra_chart_geo_dark.png';
import extraChartGeoLightSrc from './screenshots/extra_chart_geo_light.png';

import extraChartHealthDarkSrc from './screenshots/extra_chart_health_dark.png';
import extraChartHealthLightSrc from './screenshots/extra_chart_health_light.png';

import extraChartSoulDarkSrc from './screenshots/extra_chart_soul_dark.png';
import extraChartSoulLightSrc from './screenshots/extra_chart_soul_light.png';

import extraChartCompletionDarkSrc from './screenshots/extra_chart_completion_dark.png';
import extraChartCompletionLightSrc from './screenshots/extra_chart_completion_light.png';

import extraChartGrubsDarkSrc from './screenshots/extra_chart_grubs_dark.png';
import extraChartGrubsLightSrc from './screenshots/extra_chart_grubs_light.png';

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
                <ImageArea positionClassName="left-[1%] top-[13.5%] h-[6.5%] w-[28%]" href="#room-visibility">
                    Room visibility
                </ImageArea>
                <ImageArea
                    positionClassName="left-[1%] top-[20.25%] h-[6.5%] w-[28%]"
                    href="#player-movement-and-traces"
                >
                    Traces
                </ImageArea>
                <ImageArea positionClassName="left-[1%] top-[27%] h-[6.5%] w-[28%]" href="#map-coloring-by-variables">
                    Room colors
                </ImageArea>
                <ImageArea positionClassName="left-[1%] top-[36%] h-[63%] w-[28%]" href="#map-coloring-by-variables">
                    Room analytics
                </ImageArea>
                <ImageArea positionClassName="left-[1.5%] top-[45.5%] h-[6.5%] w-[27%]" href="#multi-room-buildings">
                    Multi-room buildings
                </ImageArea>
                <ImageArea positionClassName="left-[23.75%] top-[37.75%] h-[6%] aspect-square" href="#room-pin">
                    Room pinning
                </ImageArea>
                <ImageArea positionClassName="left-[30%] top-[8%] h-[85%] w-[35.25%]" href="#map">
                    Map
                </ImageArea>
                <ImageArea positionClassName="left-[30%] top-[93.5%] h-[5.5%] w-[35.25%]" href="#timeline">
                    Timeline
                </ImageArea>
                <ImageArea positionClassName="left-[66%] top-[8%] h-[32%] w-[33%]" href="#splits">
                    Splits
                </ImageArea>
                <ImageArea positionClassName="left-[66%] top-[41.25%] h-[57.75%] w-[33%]" href="#time-based-charts">
                    Time charts
                </ImageArea>
            </ImageAreaShadow>
        </ImageContainer>
    );
}

export function TracesAllScreenshot() {
    return (
        <ImageContainer className="max-w-80">
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
        <ImageContainer className="max-w-80">
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
        <ImageContainer className="max-w-80">
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
        <ImageContainer className="max-w-80">
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
        <ImageContainer className="mb-2 max-w-80">
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
        <ImageContainer className="max-w-80">
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
        <ImageContainer className="mb-2 max-w-80">
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
        <ImageContainer className="max-w-80">
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
        <ImageContainer className="mb-2 max-w-80">
            <ThemedImage
                srcLight={colorModeExpLightTableSrc}
                srcDark={colorModeExpDarkTableSrc}
                className="m-0"
                alt="Variable table row showing exponential color scale selected"
            />
        </ImageContainer>
    );
}

export function GodhomeScreenshot() {
    return (
        <ImageContainer caption="Godhome pantheons displayed on the map" className="max-w-[30rem]">
            <ThemedImage
                srcLight={godhomeLightSrc}
                srcDark={godhomeDarkSrc}
                className="m-0"
                alt="A map showing the Godhome area of the game, with colored pantheon doors."
            />
        </ImageContainer>
    );
}

export function ColosseumScreenshot() {
    return (
        <ImageContainer caption="Colosseum trials displayed on the map" className="max-w-[30rem]">
            <ThemedImage
                srcLight={colosseumLightSrc}
                srcDark={colosseumDarkSrc}
                className="m-0"
                alt="A map showing the trials in the pantheons as separate signs on the game map"
            />
        </ImageContainer>
    );
}

export function TimelineScreenshot() {
    return (
        <ImageContainer caption={<>Timeline</>} className="max-w-80">
            <ThemedImage
                srcLight={timelineLightSrc}
                srcDark={timelineDarkSrc}
                className="m-0"
                alt="a timeline similar to one on a video player"
            />
        </ImageContainer>
    );
}

export function SplitsScreenshot() {
    return (
        <ImageContainer caption={<>Splits view</>} className="max-w-48 md:float-right md:ml-4">
            <ThemedImage
                srcLight={splitsLightSrc}
                srcDark={splitsDarkSrc}
                className="m-0"
                alt="Splits view, showing charm pickups, item pickups, boss defeats"
            />
        </ImageContainer>
    );
}

export function BuildingsColormapScreenshot() {
    return (
        <ImageContainer
            caption={<>A map of dirtmouth displaying the geo spend in each building</>}
            className="max-w-48 md:float-right md:mr-4"
        >
            <ThemedImage
                srcLight={buildingsColormapLightSrc}
                srcDark={buildingsColormapDarkSrc}
                className="m-0"
                alt="A view of dirtmouth displaying the geo spend in each building by usage a colormap"
            />
        </ImageContainer>
    );
}

export function SubroomsScreenshot() {
    return (
        <ImageContainer
            caption={<>Room analytics showing a building with multiple rooms</>}
            className="max-w-48 md:float-right md:ml-4"
        >
            <ThemedImage
                srcLight={subroomsLightSrc}
                srcDark={subroomsDarkSrc}
                className="m-0"
                alt="Room analytics showing a building with multiple rooms"
            />
        </ImageContainer>
    );
}

export function GeoChartScreenshot() {
    return (
        <ImageContainer caption={<>Geo chart</>} className="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartGeoLightSrc}
                srcDark={extraChartGeoDarkSrc}
                className="m-0"
                alt="Geo chart"
            />
        </ImageContainer>
    );
}

export function HealthChartScreenshot() {
    return (
        <ImageContainer caption={<>Health chart</>} className="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartHealthLightSrc}
                srcDark={extraChartHealthDarkSrc}
                className="m-0"
                alt="Health chart"
            />
        </ImageContainer>
    );
}

export function SoulChartScreenshot() {
    return (
        <ImageContainer caption={<>Soul chart</>} className="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartSoulLightSrc}
                srcDark={extraChartSoulDarkSrc}
                className="m-0"
                alt="Soul chart"
            />
        </ImageContainer>
    );
}

export function CompletionChartScreenshot() {
    return (
        <ImageContainer caption={<>Completion chart</>} className="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartCompletionLightSrc}
                srcDark={extraChartCompletionDarkSrc}
                className="m-0"
                alt="Completion chart"
            />
        </ImageContainer>
    );
}

export function GrubsChartScreenshot() {
    return (
        <ImageContainer caption={<>Grubs chart</>} className="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartGrubsLightSrc}
                srcDark={extraChartGrubsDarkSrc}
                className="m-0"
                alt="Grubs chart"
            />
        </ImageContainer>
    );
}
