import { BadgePercentIcon } from 'lucide-solid';
import type { Component } from 'solid-js';
import { cn } from '~/lib/utils';
import {
	blueMaskImg,
	coinImg,
	dreamNailImg,
	emptyMaskImg,
	grubImage,
	maskImg,
	steelMaskImg,
	vesselImg,
} from '../img-urls';
import { useGameplayStoreOptional } from '../store/gameplay-store';

export const CompletionChartUnitIcon: Component<{ class?: string }> = (props) => {
	return <BadgePercentIcon class={props.class} />;
};

export const SoulChartUnitIcon: Component<{ class?: string }> = (props) => {
	return <img src={vesselImg} class={props.class} alt="Soul" />;
};

export const HealthChartMaskUnitIcon: Component<{ class?: string }> = (props) => {
	const gameplayStore = useGameplayStoreOptional();
	const isSteelSoul = () => gameplayStore?.isSteelSoul() ?? false;
	return <img src={isSteelSoul() ? steelMaskImg : maskImg} class={props.class} alt="Mask" />;
};
export const LifebloodUnit: Component<{ class?: string }> = (props) => {
	return <img src={blueMaskImg} class={cn(props.class, '-mx-1 w-7')} alt="Lifeblood" />;
};
export const EmptyMaskUnit: Component<{ class?: string }> = (props) => {
	return <img src={emptyMaskImg} class={props.class} alt="Empty mask" />;
};

export const GeoChartUnitIcon: Component<{ class?: string }> = (props) => {
	return <img src={coinImg} class={props.class} alt="Geo" />;
};

export const EssenceChartUnitIcon: Component<{ class?: string }> = (props) => {
	return <img src={dreamNailImg} class={cn('drop-shadow-glow-sm', props.class)} alt="Dream nail" />;
};

export const GrubChartUnitIcon: Component<{ class?: string }> = (props) => {
	return <img src={grubImage} class={props.class} alt="Grub" />;
};
