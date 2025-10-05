import { Play } from 'lucide-solid';
import { Show, createEffect, createSignal } from 'solid-js';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

export function Video(props: { width: number; height: number; srcLight: string; srcDark: string; class?: string }) {
	const [isPlaying, setIsPlaying] = createSignal(true);

	async function handleClick() {
		if (isPlaying()) {
			lightVideoRef?.pause?.();
			darkVideoRef?.pause?.();
		} else {
			await Promise.all([lightVideoRef?.play(), darkVideoRef?.play()]);
		}
	}

	function updateIsPlaying() {
		setIsPlaying(lightVideoRef?.paused === false || darkVideoRef?.paused === false);
	}

	createEffect(() => {
		updateIsPlaying();
	});

	const sharedClassName = 'max-w-[102%] relative -m-px -mt-px -mb-px pointer-events-none';
	const lightVideoRef = (
		<video
			width={props.width}
			height={props.height}
			loop={true}
			autoplay={true}
			muted={true}
			playsinline={true}
			class={cn(sharedClassName, 'block dark:hidden', props.class)}
			onPlay={updateIsPlaying}
			onPause={updateIsPlaying}
			tabIndex={-1}
		>
			<source src={props.srcLight} type="video/mp4" />
			Your browser does not support the video tag.
		</video>
	) as HTMLVideoElement;
	const darkVideoRef = (
		<video
			width={props.width}
			height={props.height}
			loop={true}
			autoplay={true}
			muted={true}
			playsinline={true}
			class={cn(sharedClassName + 'left-2 -top-px hidden dark:block', props.class)}
			onPlay={updateIsPlaying}
			onPause={updateIsPlaying}
			tabIndex={-1}
		>
			<source src={props.srcDark} type="video/mp4" />
			Your browser does not support the video tag.
		</video>
	) as HTMLVideoElement;

	return (
		<Button
			class="group relative h-fit w-fit overflow-hidden rounded-md bg-white p-0 dark:bg-black"
			onClick={handleClick}
		>
			{lightVideoRef}
			{darkVideoRef}
			<Show when={!isPlaying()}>
				<Play class="absolute bottom-3 right-3 h-5 w-5 text-foreground" />
			</Show>
		</Button>
	);
}
