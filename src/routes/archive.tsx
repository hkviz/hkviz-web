import { Key } from '@solid-primitives/keyed';
import { Title } from '@solidjs/meta';
import { createAsync, RouteDefinition } from '@solidjs/router';
import { Show } from 'solid-js';
import { AuthNeeded } from '~/components/auth-needed';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { RunCard } from '~/components/run-card';
import { useSession } from '~/lib/auth/client';
import { findOwnRuns } from '~/server/run/find-own-runs';

export const route = {
	load: () => {
		void findOwnRuns({ archived: true });
	},
} satisfies RouteDefinition;

export default function ArchivePage() {
	const runs = createAsync(() => findOwnRuns({ archived: true }));

	const session = useSession();
	const userId = () => session()?.user?.id;

	return (
		<>
			<Title>Archived gameplays - HKViz</Title>
			<Show when={userId()} fallback={<AuthNeeded />}>
				<ContentCenterWrapper>
					<div class="w-full max-w-[800px]">
						<h1 class="mb-4 mt-4 pl-2 text-center font-serif text-3xl font-semibold">
							Your archived gameplays
						</h1>
						<ul class="flex flex-col">
							<Key
								each={runs()}
								by={(it) => it.id}
								fallback={<span>You do not have any archived gameplays</span>}
							>
								{(run) => (
									<li>
										<RunCard run={run()} showUser={false} isOwnRun={true} />
									</li>
								)}
							</Key>
						</ul>
					</div>
				</ContentCenterWrapper>
			</Show>
		</>
	);
}
