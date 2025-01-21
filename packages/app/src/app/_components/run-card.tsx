'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { type PropsWithChildren } from 'react';
import { type GetRunResult } from '~/server/api/routers/run/run-get';
import { type RunMetadata } from '~/server/api/routers/run/runs-find';
import Coin from '../../../public/ingame-sprites/hud/HUD_coin_v020004.png';
import HealthFrameSteelSoulBrokenImg from '../../../public/ingame-sprites/hud/break_hud.png';
import HealthFrameSteelSoulSmallImg from '../../../public/ingame-sprites/hud/mode_select_Steel_Soul_HUD.png';
import SmallSoulOrb from '../../../public/ingame-sprites/hud/select_game_HUD_0000_magic_orb.png';
import SmallSoulOrbSteelSoul from '../../../public/ingame-sprites/hud/select_game_HUD_0000_magic_orb_steel.png';
import OneHealth from '../../../public/ingame-sprites/hud/select_game_HUD_0001_health.png';
import OneHealthSteelSoul from '../../../public/ingame-sprites/hud/select_game_HUD_0001_health_steel.png';
import HealthFrameImg from '../../../public/ingame-sprites/hud/select_game_HUD_0002_health_frame.png';
import HealthFrameSteelSoulImg from '../../../public/ingame-sprites/hud/select_game_HUD_Steel_Soul.png';
import DreamNailAwokenImg from '../../../public/ingame-sprites/inventory/dream_nail_0000_4.png';
import DreamNailImg from '../../../public/ingame-sprites/inventory/dream_nail_0003_1.png';
import { getMapZoneHudBackground } from './area-background';
import { RelativeDate } from './date';
import { RunTags } from './run-tags';

function Duration({ seconds }: { seconds: number }) {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor((seconds / 60) % 60);

    const duration: string[] = [];
    if (hours > 0) duration.push(`${hours}h`);
    if (minutes > 0) duration.push(`${minutes}m`);

    if (duration.length === 0) return <span>0m</span>;

    return <>{duration.join(' ')}</>;
}

const interactiveBrightnessClasses =
    'group-focus-within:brightness-110 group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90';

function HealthFrame({ isSteelSoul, isBrokenSteelSoul }: { isSteelSoul: boolean; isBrokenSteelSoul: boolean }) {
    if (isBrokenSteelSoul) {
        return (
            <Image
                src={HealthFrameSteelSoulBrokenImg}
                alt="Broken Steel Soul game mode frame"
                className={cn(
                    'absolute left-[-2.5rem] top-[-2rem] z-[2] h-[10rem] w-auto max-w-none',
                    interactiveBrightnessClasses,
                )}
            />
        );
    }
    if (isSteelSoul) {
        return (
            <>
                <Image
                    src={HealthFrameSteelSoulImg}
                    alt="Steel Soul game mode frame"
                    className={cn(
                        'roup-focus-visible:brightness-110 absolute left-[-2.5rem] top-[-2rem] z-[2] hidden h-[10rem] w-auto max-w-none sm:block',
                        interactiveBrightnessClasses,
                    )}
                />
                <Image
                    src={HealthFrameSteelSoulSmallImg}
                    alt="Steel Soul game mode frame"
                    className={cn(
                        'absolute left-[-2.5rem] top-[-2rem] z-[2] h-[10rem] w-auto max-w-none sm:hidden',
                        interactiveBrightnessClasses,
                    )}
                />
            </>
        );
    }

    return (
        <Image
            src={HealthFrameImg}
            alt="Standard game mode frame"
            className="absolute left-1 top-0 z-[2] h-[6rem] w-auto max-w-none"
        />
    );
}

function RunCardEpicInfo({
    title,
    children,
    className,
    href,
}: PropsWithChildren<{ title: React.ReactNode; className?: string; href?: string }>) {
    const spans = (
        <span className={cn('z-[4] flex flex-row items-baseline gap-1 drop-shadow-sm', className)}>
            <span className="text-xs md:text-sm">{title}</span>
            <span className="text-sm font-bold md:text-base">{children}</span>
        </span>
    );

    if (!href) return spans;

    return (
        <Link className="hover:drop-shadow-glow-md z-[7] hover:underline" href={href}>
            {spans}
        </Link>
    );
}

function RunTitle({ run }: { run: RunMetadata }) {
    if (run.title) {
        return (
            <h2 className="color-white relative z-[8] font-serif text-xl font-bold drop-shadow-sm md:text-2xl">
                {run.title}
            </h2>
        );
    } else {
        return undefined;
    }
}

export function RunCard({
    run,
    showUser = true,
    onClick,
}: {
    run: RunMetadata | GetRunResult;
    showUser?: boolean;
    onClick?: (runId: string) => void;
}) {
    const gameState = run.gameState;
    const BgImage = getMapZoneHudBackground(gameState?.mapZone);

    const isSteelSoul = run.isSteelSoul;
    const isBrokenSteelSoul = run.isBrokenSteelSoul;

    const soulOrbImgSrc = isSteelSoul ? SmallSoulOrbSteelSoul : SmallSoulOrb;
    const healthImgSrc = isSteelSoul ? OneHealthSteelSoul : OneHealth;

    return (
        <div
            key={run.id}
            className={cn(
                'focus-within:drop-shadow-glow-md hover:drop-shadow-glow-sm group relative mb-2 flex h-[unset] w-full flex-col items-stretch justify-between overflow-hidden rounded-[1.25rem] bg-black py-2 pl-4 pr-3 text-white transition hover:bg-black hover:text-white active:drop-shadow-none md:flex-row',
            )}
        >
            {/* https://css-tricks.com/nested-links/ */}

            {onClick ? (
                <button onClick={() => onClick(run.id)} className="absolute inset-0 z-[6] block"></button>
            ) : (
                <Link href={`/run/${run.id}`} className="absolute inset-0 z-[6] block"></Link>
            )}
            <div className="flex grow flex-col">
                <div className="-mb-4 flex flex-row items-start justify-end gap-1 sm:-mb-7">
                    <RunTags codes={run.tags} />
                </div>
                <div className="flex flex-grow flex-row">
                    <div className="relative z-[3] -mb-5 h-[7rem] w-[4rem] shrink-0 origin-top-left scale-75 sm:mb-0 sm:w-[6.5rem] sm:scale-100">
                        <HealthFrame isSteelSoul={isSteelSoul} isBrokenSteelSoul={isBrokenSteelSoul} />
                        {(gameState?.mpReserveMax ?? 100) >= 99 && (
                            <Image
                                src={soulOrbImgSrc}
                                alt="Soul orb"
                                className="absolute bottom-[2.75rem] left-[-0.85rem] z-[3] scale-90"
                            />
                        )}
                        {(gameState?.mpReserveMax ?? 100) >= 66 && (
                            <Image
                                src={soulOrbImgSrc}
                                alt="Soul orb"
                                className="absolute bottom-[1.6rem] left-[-0.4rem] z-[3] scale-95"
                            />
                        )}
                        {(gameState?.mpReserveMax ?? 100) >= 33 && (
                            <Image
                                src={soulOrbImgSrc}
                                alt="Soul orb"
                                className="absolute bottom-[0.65rem] left-[0.5rem] z-[3]"
                            />
                        )}
                    </div>
                    <div className="flex grow flex-col">
                        <div className="relative z-[4] mt-4 flex flex-row flex-wrap gap-1 drop-shadow-sm sm:gap-2">
                            {[...Array(gameState?.maxHealth ?? 5).keys()].map((i) => (
                                <Image src={healthImgSrc} alt="Health" key={i} className="-mb-1 w-5 sm:w-6" />
                            ))}
                        </div>
                        <div className="relative z-[4] mt-1 flex w-full flex-row gap-2 font-serif text-2xl drop-shadow-sm sm:mt-3">
                            <span>
                                <Image src={Coin} alt="Geo icon" className="drop-shadow-glow-md inline-block w-7 p-1" />
                                <span className="text-xl font-semibold sm:text-2xl">{gameState?.geo ?? '?'}</span>
                            </span>
                            {gameState?.dreamOrbs ? (
                                <span>
                                    <Image
                                        src={gameState?.dreamNailUpgraded ? DreamNailAwokenImg : DreamNailImg}
                                        alt="Essence icon"
                                        className="drop-shadow-glow-md -mb-3 -mt-4 inline-block w-7 p-1 brightness-110 sm:w-9"
                                    />
                                    <span className="text-xl font-semibold sm:text-2xl">{gameState.dreamOrbs}</span>
                                </span>
                            ) : undefined}
                            {displayPercentage(gameState) && (
                                <span className="ml-4">
                                    <span className="text-xl font-semibold sm:text-2xl">
                                        {gameState.completionPercentage}
                                    </span>
                                    %
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="-mt-3">
                    <RunTitle run={run} />
                    <div className="flex flex-row flex-wrap justify-start gap-4 gap-y-0 font-serif">
                        {run.user?.name && showUser && (
                            <RunCardEpicInfo title="By:" href={`/player/${run.user.id}`}>
                                {run.user.name}
                            </RunCardEpicInfo>
                        )}
                        {!!gameState?.playTime && (
                            <RunCardEpicInfo title="Playtime:">
                                <Duration seconds={gameState.playTime} />
                            </RunCardEpicInfo>
                        )}
                        {run.lastPlayedAt && (
                            <RunCardEpicInfo title="Last played:">
                                <RelativeDate date={run.lastPlayedAt} withTooltip={false} />
                            </RunCardEpicInfo>
                        )}
                    </div>
                </div>
            </div>

            {/* Background */}
            <Image
                className="l-0 t-0 absolute z-[1] h-full w-full bg-black object-cover opacity-70 group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90"
                src={BgImage}
                alt="Area background image"
            />
            <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black via-transparent to-black"></div>
        </div>
    );
}

function displayPercentage(
    gameState: RunMetadata['gameState'],
): gameState is RunMetadata['gameState'] & { completionPercentage: number } {
    if (!gameState) return false;

    return (
        (!!gameState.killedHollowKnight ||
            !!gameState.killedVoidIdol ||
            !!gameState.killedFinalBoss ||
            !!gameState.unlockedCompletionRate) &&
        !!gameState.completionPercentage
    );
}
