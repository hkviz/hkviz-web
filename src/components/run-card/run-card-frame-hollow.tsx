import {Component, Match, Switch} from "solid-js";
import {
    healthFrameImg,
    healthFrameSteelSoulBrokenImg,
    healthFrameSteelSoulImg,
    healthFrameSteelSoulSmallImg
} from "~/lib/viz";
import {cn} from "~/lib/utils.ts";
import {runCardInteractiveBrightnessClasses} from "~/components/run-card/run-card-interactive-brightness-classes.tsx";
import {CrestNameSilk} from "~/lib/game-data/silk-data/crests-silk.generated.ts";


export const RunCardFrameHollow: Component<{ isSteelSoul: boolean; isBrokenSteelSoul: boolean }> = (props) => {
    const crest: CrestNameSilk = 'Hunter';
    return (
        <Switch
            fallback={
                <img
                    src={healthFrameImg}
                    alt="Standard game mode frame"
                    class="absolute top-0 left-1 z-2 h-24 w-auto max-w-none"
                />
            }
        >
            <Match when={props.isBrokenSteelSoul}>
                <img
                    src={healthFrameSteelSoulBrokenImg}
                    alt="Broken Steel Soul game mode frame"
                    class={cn('absolute -top-8 -left-10 z-2 h-40 w-auto max-w-none', runCardInteractiveBrightnessClasses)}
                />
            </Match>
            <Match when={props.isSteelSoul}>
                <img
                    src={healthFrameSteelSoulImg}
                    alt="Steel Soul game mode frame"
                    class={cn(
                        'roup-focus-visible:brightness-110 absolute -top-8 -left-10 z-2 hidden h-40 w-auto max-w-none sm:block',
                        runCardInteractiveBrightnessClasses,
                    )}
                />
                <img
                    src={healthFrameSteelSoulSmallImg}
                    alt="Steel Soul game mode frame"
                    class={cn(
                        'absolute -top-8 -left-10 z-2 h-40 w-auto max-w-none sm:hidden',
                        runCardInteractiveBrightnessClasses,
                    )}
                />
            </Match>
        </Switch>
    );
};