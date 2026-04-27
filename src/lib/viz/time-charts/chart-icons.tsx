import { BadgePercentIcon } from 'lucide-solid';
import type { Component } from 'solid-js';
import { cn } from '~/lib/utils';
import {
	blueMaskImg,
	boneScrollImg,
	coinImg,
	crawbellImg,
	dreamNailImg,
	emptyMaskImg,
	grubImage,
	hornetDeathPinImg,
	hornetHealthEmptyImg,
	hornetHealthEmptySteelImg,
	hornetHealthImg,
	hornetHealthLifebloodImg,
	maskImg,
	rosaryHudImg,
	rosaryIconImg,
	rosaryStringImg,
	shellBundleImg,
	shellShardImg,
	steelMaskImg,
	vesselImg,
} from '../img-urls';
import { useGameplayStoreOptional } from '../store/gameplay-store';

export type UnitIconComponent = Component<{ class?: string }>;

// hollow
export const SoulChartUnitIconHollow: UnitIconComponent = (props) => {
	return <img src={vesselImg} class={props.class} alt="Soul" />;
};

export const HealthChartMaskUnitIconHollow: UnitIconComponent = (props) => {
	const gameplayStore = useGameplayStoreOptional();
	const isSteelSoul = () => gameplayStore?.isSteelSoul() ?? false;
	return <img src={isSteelSoul() ? steelMaskImg : maskImg} class={props.class} alt="Mask" />;
};
export const LifebloodUnitHollow: UnitIconComponent = (props) => {
	return <img src={blueMaskImg} class={cn(props.class, '-mx-1 w-7')} alt="Lifeblood" />;
};
export const EmptyMaskUnitHollow: UnitIconComponent = (props) => {
	return <img src={emptyMaskImg} class={props.class} alt="Empty mask" />;
};

export const GeoChartUnitIconHollow: UnitIconComponent = (props) => {
	return <img src={coinImg} class={props.class} alt="Geo" />;
};

export const EssenceChartUnitIconHollow: UnitIconComponent = (props) => {
	return <img src={dreamNailImg} class={cn('drop-shadow-glow-sm', props.class)} alt="Dream nail" />;
};

export const GrubChartUnitIconHollow: UnitIconComponent = (props) => {
	return <img src={grubImage} class={props.class} alt="Grub" />;
};

// silk
export const RosaryChartUnitIconSilk: UnitIconComponent = (props) => {
	return <img src={rosaryHudImg} class={props.class} alt="Rosary" />;
};
export const RosariesChartUnitIconSilk: UnitIconComponent = (props) => {
	return <img src={rosaryIconImg} class={props.class} alt="Rosary" />;
};
export const CocoonUnitIconSilk: UnitIconComponent = (props) => {
	return <img src={hornetDeathPinImg} class={props.class} alt="Cocoon" />;
};
export const CrawbellChartUnitIconSilk: UnitIconComponent = (props) => {
	return <img src={crawbellImg} class={props.class} alt="Crawbell" />;
};
export const RosaryStringUnitIconSilk: UnitIconComponent = (props) => {
	return <img src={rosaryStringImg} class={props.class} alt="Rosary string" />;
};
export const RelicUnitIconSilk: UnitIconComponent = (props) => {
	return <img src={boneScrollImg} class={props.class} alt="Relic" />;
};
export const HealthChartMaskUnitIconSilk: UnitIconComponent = (props) => {
	const gameplayStore = useGameplayStoreOptional();
	const isSteelSoul = () => gameplayStore?.isSteelSoul() ?? false;
	return <img src={isSteelSoul() ? hornetHealthImg : hornetHealthImg} class={props.class} alt="Mask" />;
};
export const ShellShardUnitIconSilk: UnitIconComponent = (props) => {
	return <img src={shellShardImg} class={props.class} alt="Shell Shard" />;
};
export const ShellShardBundleUnitIconSilk: UnitIconComponent = (props) => {
	return <img src={shellBundleImg} class={cn(props.class, 'w-5')} alt="Shell Shard Bundle" />;
};
export const HealthEmptyChartMaskUnitIconSilk: UnitIconComponent = (props) => {
	const gameplayStore = useGameplayStoreOptional();
	const isSteelSoul = () => gameplayStore?.isSteelSoul() ?? false;
	return (
		<img
			src={isSteelSoul() ? hornetHealthEmptySteelImg : hornetHealthEmptyImg}
			class={props.class}
			alt="Empty mask"
		/>
	);
};
export const LifebloodUnitSilk: UnitIconComponent = (props) => {
	return <img src={hornetHealthLifebloodImg} class={cn(props.class, '-mx-1 w-7')} alt="Lifeblood" />;
};

// shared
export const CompletionChartUnitIcon: UnitIconComponent = (props) => {
	return <BadgePercentIcon class={props.class} />;
};
