import { HKVizText } from '@hkviz/viz-ui';
import { ImageContainer, ThemedImage } from './_image_component';
import { ImageArea, ImageAreaShadow } from './_image_component_client';

import overviewDarkSrc from './screenshots/overview_dark.png?hero';
console.log({ overviewDarkSrc });
import overviewLightSrc from './screenshots/overview_light.png?hero';

import tracesAllDarkSrc from './screenshots/traces_all_dark.png?hero';
import tracesAllLightSrc from './screenshots/traces_all_light.png?hero';

import tracesAnimatedDarkSrc from './screenshots/traces_animated_dark.png?hero';
import tracesAnimatedLightSrc from './screenshots/traces_animated_light.png?hero';

import tracesNoneDarkSrc from './screenshots/traces_none_dark.png?hero';
import tracesNoneLightSrc from './screenshots/traces_none_light.png?hero';

import roomAnalyticsDarkSrc from './screenshots/room_analytics_dark.png?hero';
import roomAnalyticsLightSrc from './screenshots/room_analytics_light.png?hero';

import colorModeAreaDarkSrc from './screenshots/room_colors_area_dark.png?hero';
import colorModeAreaDarkTableSrc from './screenshots/room_colors_area_dark_table.png?hero';
import colorModeAreaLightSrc from './screenshots/room_colors_area_light.png?hero';
import colorModeAreaLightTableSrc from './screenshots/room_colors_area_light_table.png?hero';

import colorModeLinearDarkSrc from './screenshots/room_colors_linear_dark.png?hero';
import colorModeLinearDarkTableSrc from './screenshots/room_colors_linear_dark_table.png?hero';
import colorModeLinearLightSrc from './screenshots/room_colors_linear_light.png?hero';
import colorModeLinearLightTableSrc from './screenshots/room_colors_linear_light_table.png?hero';

import colorModeExpDarkSrc from './screenshots/room_colors_exp3_dark.png?hero';
import colorModeExpDarkTableSrc from './screenshots/room_colors_exp3_dark_table.png?hero';
import colorModeExpLightSrc from './screenshots/room_colors_exp3_light.png?hero';
import colorModeExpLightTableSrc from './screenshots/room_colors_exp3_light_table.png?hero';

import godhomeDarkSrc from './screenshots/godhome_dark.png?hero';
import godhomeLightSrc from './screenshots/godhome_light.png?hero';

import colosseumDarkSrc from './screenshots/colluseum_dark.png?hero';
import colosseumLightSrc from './screenshots/colluseum_light.png?hero';

import timelineDarkSrc from './screenshots/timeline_dark.png?hero';
import timelineLightSrc from './screenshots/timeline_light.png?hero';

import splitsDarkSrc from './screenshots/splits_dark.png?hero';
import splitsLightSrc from './screenshots/splits_light.png?hero';

import buildingsColormapDarkSrc from './screenshots/buildings_colormap_dark.png?hero';
import buildingsColormapLightSrc from './screenshots/buildings_colormap_light.png?hero';

import subroomsDarkSrc from './screenshots/subrooms_dark.png?hero';
import subroomsLightSrc from './screenshots/subrooms_light.png?hero';

import extraChartGeoDarkSrc from './screenshots/extra_chart_geo_dark.png?hero';
import extraChartGeoLightSrc from './screenshots/extra_chart_geo_light.png?hero';

import extraChartHealthDarkSrc from './screenshots/extra_chart_health_dark.png?hero';
import extraChartHealthLightSrc from './screenshots/extra_chart_health_light.png?hero';

import extraChartSoulDarkSrc from './screenshots/extra_chart_soul_dark.png?hero';
import extraChartSoulLightSrc from './screenshots/extra_chart_soul_light.png?hero';

import extraChartCompletionDarkSrc from './screenshots/extra_chart_completion_dark.png?hero';
import extraChartCompletionLightSrc from './screenshots/extra_chart_completion_light.png?hero';

import extraChartGrubsDarkSrc from './screenshots/extra_chart_grubs_dark.png?hero';
import extraChartGrubsLightSrc from './screenshots/extra_chart_grubs_light.png?hero';
import {
    IMAGE_SIZE_ARTICLE_FULL_WIDTH,
    IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD,
    IMAGE_SIZE_MAX_W_30REM,
    IMAGE_SIZE_MAX_W_48,
    IMAGE_SIZE_MAX_W_60,
} from '~/components/image';

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
                    class="m-0"
                    alt="HKViz gameplay analytics page"
                    sizes={IMAGE_SIZE_ARTICLE_FULL_WIDTH}
                />
                {/* <ImageArea positionClassName="left-[1%] top-[9%] h-[32%] w-[28%]" href="#map-options">
                    Map options
                </ImageArea> */}
                <ImageArea positionClass="left-[0.5%] top-[13%] h-[6.25%] w-[28%]" href="#room-visibility">
                    Room visibility
                </ImageArea>
                <ImageArea
                    positionClass="left-[0.5%] top-[19.25%] h-[6.25%] w-[28%]"
                    href="#player-movement-and-traces"
                >
                    Traces
                </ImageArea>
                {/* TODO change link */}
                {/* <ImageArea positionClassName="left-[0.5%] top-[25.5%] h-[9%] w-[28%]" href="#map-coloring-by-variables">
                    Area names 
                </ImageArea> */}
                <ImageArea positionClass="left-[0.5%] top-[35%] h-[64%] w-[28%]" href="#map-coloring-by-variables">
                    Room analytics
                </ImageArea>
                <ImageArea positionClass="left-[1%] top-[43.5%] h-[6.5%] w-[27%]" href="#multi-room-buildings">
                    Multi-room buildings
                </ImageArea>
                <ImageArea positionClass="left-[24.25%] top-[36.75%] h-[6%] aspect-square" href="#room-pin">
                    Room pinning
                </ImageArea>
                <ImageArea positionClass="left-[29%] top-[7.75%] h-[83.25%] w-[37%]" href="#map">
                    Map
                </ImageArea>
                {/* TODO add auto zoom link */}
                <ImageArea positionClass="left-[29%] top-[91.5%] h-[7.75%] w-[37%]" href="#timeline">
                    Timeline
                </ImageArea>
                <ImageArea positionClass="left-[66.5%] top-[7.75%] h-[30.25%] w-[33%]" href="#splits">
                    Splits
                </ImageArea>
                <ImageArea positionClass="left-[66.5%] top-[39%] h-[60.25%] w-[33%]" href="#time-based-charts">
                    Time charts
                </ImageArea>
            </ImageAreaShadow>
        </ImageContainer>
    );
}

export function TracesAllScreenshot() {
    return (
        <ImageContainer class="max-w-80">
            <ThemedImage
                srcLight={tracesAllLightSrc}
                srcDark={tracesAllDarkSrc}
                class="m-0"
                alt="Traces on game map showing all player movement within a gameplay in the Forgotten Crossroads area"
                sizes={IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD}
            />
        </ImageContainer>
    );
}

export function TracesAnimatedScreenshot() {
    return (
        <ImageContainer class="max-w-80">
            <ThemedImage
                srcLight={tracesAnimatedLightSrc}
                srcDark={tracesAnimatedDarkSrc}
                class="m-0"
                alt="Traces on game map showing player movement of 4 minutes. The traces fade out, for positions further in the past in the Forgotten Crossroads area"
                sizes={IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD}
            />
        </ImageContainer>
    );
}

export function TracesNoneScreenshot() {
    return (
        <ImageContainer class="max-w-80">
            <ThemedImage
                srcLight={tracesNoneLightSrc}
                srcDark={tracesNoneDarkSrc}
                class="m-0"
                alt="A game map showing rooms of Forgotten Crossroads with no traces on top, displaying player movement."
                sizes={IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD}
            />
        </ImageContainer>
    );
}

export function RoomAnalyticsScreenshot() {
    return (
        <ImageContainer
            class="max-w-48 md:float-right md:ml-4"
            caption={
                <span>
                    <HKVizText /> Room analytics panel
                </span>
            }
        >
            <ThemedImage
                srcLight={roomAnalyticsLightSrc}
                srcDark={roomAnalyticsDarkSrc}
                class="m-0"
                alt="A table showing various variables of a room selected on the map."
                sizes={IMAGE_SIZE_MAX_W_48}
            />
        </ImageContainer>
    );
}

export function ColorModeAreaScreenshot() {
    return (
        <ImageContainer class="max-w-80">
            <ThemedImage
                srcLight={colorModeAreaLightSrc}
                srcDark={colorModeAreaDarkSrc}
                class="m-0"
                alt="A map showing the area colors of the game rooms"
                sizes={IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD}
            />
        </ImageContainer>
    );
}

export function ColorModeAreaTableScreenshot() {
    return (
        <ImageContainer class="mb-2 max-w-80">
            <ThemedImage
                srcLight={colorModeAreaLightTableSrc}
                srcDark={colorModeAreaDarkTableSrc}
                class="m-0"
                alt="Variable table row showing area color mode selected"
                sizes={IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD}
            />
        </ImageContainer>
    );
}

export function ColorModeLinearScreenshot() {
    return (
        <ImageContainer class="max-w-80">
            <ThemedImage
                srcLight={colorModeLinearLightSrc}
                srcDark={colorModeLinearDarkSrc}
                class="m-0"
                alt="A map showing rooms colored by the geo earned by area"
                sizes={IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD}
            />
        </ImageContainer>
    );
}

export function ColorModeLinearTableScreenshot() {
    return (
        <ImageContainer class="mb-2 max-w-80">
            <ThemedImage
                srcLight={colorModeLinearLightTableSrc}
                srcDark={colorModeLinearDarkTableSrc}
                class="m-0"
                alt="Variable table row showing linear color scale selected"
                sizes={IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD}
            />
        </ImageContainer>
    );
}

export function ColorModeExpScreenshot() {
    return (
        <ImageContainer class="max-w-80">
            <ThemedImage
                srcLight={colorModeExpLightSrc}
                srcDark={colorModeExpDarkSrc}
                class="m-0"
                alt="A map showing rooms colored by the geo earned by area in an exponential scale"
                sizes={IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD}
            />
        </ImageContainer>
    );
}

export function ColorModeExpTableScreenshot() {
    return (
        <ImageContainer class="mb-2 max-w-80">
            <ThemedImage
                srcLight={colorModeExpLightTableSrc}
                srcDark={colorModeExpDarkTableSrc}
                class="m-0"
                alt="Variable table row showing exponential color scale selected"
                sizes={IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD}
            />
        </ImageContainer>
    );
}

export function GodhomeScreenshot() {
    return (
        <ImageContainer caption="Godhome pantheons displayed on the map" class="max-w-[30rem]">
            <ThemedImage
                srcLight={godhomeLightSrc}
                srcDark={godhomeDarkSrc}
                class="m-0"
                alt="A map showing the Godhome area of the game, with colored pantheon doors."
                sizes={IMAGE_SIZE_MAX_W_30REM}
            />
        </ImageContainer>
    );
}

export function ColosseumScreenshot() {
    return (
        <ImageContainer caption="Colosseum trials displayed on the map" class="max-w-[30rem]">
            <ThemedImage
                srcLight={colosseumLightSrc}
                srcDark={colosseumDarkSrc}
                class="m-0"
                alt="A map showing the trials in the pantheons as separate signs on the game map"
                sizes={IMAGE_SIZE_MAX_W_30REM}
            />
        </ImageContainer>
    );
}

export function TimelineScreenshot() {
    return (
        <ImageContainer caption={<>Timeline</>} class="max-w-80">
            <ThemedImage
                srcLight={timelineLightSrc}
                srcDark={timelineDarkSrc}
                class="m-0"
                alt="a timeline similar to one on a video player"
                sizes={IMAGE_SIZE_ARTICLE_FULL_WIDTH}
            />
        </ImageContainer>
    );
}

export function SplitsScreenshot() {
    return (
        <ImageContainer caption={<>Splits view</>} class="max-w-48 md:float-right md:ml-4">
            <ThemedImage
                srcLight={splitsLightSrc}
                srcDark={splitsDarkSrc}
                class="m-0"
                alt="Splits view, showing charm pickups, item pickups, boss defeats"
                sizes={IMAGE_SIZE_MAX_W_48}
            />
        </ImageContainer>
    );
}

export function BuildingsColormapScreenshot() {
    return (
        <ImageContainer
            caption={<>A map of dirtmouth displaying the geo spend in each building</>}
            class="max-w-48 md:float-right md:mr-4"
        >
            <ThemedImage
                srcLight={buildingsColormapLightSrc}
                srcDark={buildingsColormapDarkSrc}
                class="m-0"
                alt="A view of dirtmouth displaying the geo spend in each building by usage a colormap"
                sizes={IMAGE_SIZE_MAX_W_48}
            />
        </ImageContainer>
    );
}

export function SubroomsScreenshot() {
    return (
        <ImageContainer
            caption={<>Room analytics showing a building with multiple rooms</>}
            class="max-w-48 md:float-right md:ml-4"
        >
            <ThemedImage
                srcLight={subroomsLightSrc}
                srcDark={subroomsDarkSrc}
                class="m-0"
                alt="Room analytics showing a building with multiple rooms"
                sizes={IMAGE_SIZE_MAX_W_48}
            />
        </ImageContainer>
    );
}

export function GeoChartScreenshot() {
    return (
        <ImageContainer caption={<>Geo chart</>} class="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartGeoLightSrc}
                srcDark={extraChartGeoDarkSrc}
                class="m-0"
                alt="Geo chart"
                sizes={IMAGE_SIZE_MAX_W_60}
            />
        </ImageContainer>
    );
}

export function HealthChartScreenshot() {
    return (
        <ImageContainer caption={<>Health chart</>} class="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartHealthLightSrc}
                srcDark={extraChartHealthDarkSrc}
                class="m-0"
                alt="Health chart"
                sizes={IMAGE_SIZE_MAX_W_60}
            />
        </ImageContainer>
    );
}

export function SoulChartScreenshot() {
    return (
        <ImageContainer caption={<>Soul chart</>} class="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartSoulLightSrc}
                srcDark={extraChartSoulDarkSrc}
                class="m-0"
                alt="Soul chart"
                sizes={IMAGE_SIZE_MAX_W_60}
            />
        </ImageContainer>
    );
}

export function CompletionChartScreenshot() {
    return (
        <ImageContainer caption={<>Completion chart</>} class="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartCompletionLightSrc}
                srcDark={extraChartCompletionDarkSrc}
                class="m-0"
                alt="Completion chart"
                sizes={IMAGE_SIZE_MAX_W_60}
            />
        </ImageContainer>
    );
}

export function GrubsChartScreenshot() {
    return (
        <ImageContainer caption={<>Grubs chart</>} class="max-w-60 md:float-right md:ml-4">
            <ThemedImage
                srcLight={extraChartGrubsLightSrc}
                srcDark={extraChartGrubsDarkSrc}
                class="m-0"
                alt="Grubs chart"
                sizes={IMAGE_SIZE_MAX_W_60}
            />
        </ImageContainer>
    );
}
