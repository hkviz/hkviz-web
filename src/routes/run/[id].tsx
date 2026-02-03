import { Title } from '@solidjs/meta';
import { RouteSectionProps, createAsync } from '@solidjs/router';
import { Show, createMemo } from 'solid-js';
import { ContentWrapper } from '~/components/content-wrapper';
import { RunCard } from '~/components/run-card';
import { useUser } from '~/lib/auth/client';
import { GameplayDashboard, createRunFileLoader } from '~/lib/viz';
import { RunStoresProvider } from '~/lib/viz/store/store-context';
import { getRun } from '~/server/run/run-get';
import { getRunPageTitle } from './_metadata';

// TODO
// export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
//     const session = await getServerAuthSession();
//     return getRunMeta(params.id, session?.user?.id ?? null);
// }

function SingleRunLoadingWrapper(props: { id: string }) {
	const runData = createAsync(() => getRun(props.id));
	const user = useUser();

	const loader = createMemo(() => {
		const run = runData();
		if (!run) return null;
		return createRunFileLoader(run.files);
	});

	return (
		<Show when={runData()}>
			{(runData) => (
				<Show when={loader()}>
					{(loader) => (
						<>
							<Title>{getRunPageTitle(runData())}</Title>
							<GameplayDashboard
								startDate={runData().startedAt}
								fileInfos={runData().files}
								runFileLoader={loader()}
								gameplayCard={
									<RunCard
										run={runData()}
										showUser={true}
										isOwnRun={user()?.id === runData().user.id}
									/>
								}
							/>
						</>
					)}
				</Show>
			)}
		</Show>
	);
}

export default function SingleRunPage(props: RouteSectionProps) {
	const id = () => props.params.id;
	return (
		<RunStoresProvider>
			<ContentWrapper footerOutOfSight={true}>
				<Show when={id()} fallback={<div>Invalid run ID</div>}>
					{(id) => <SingleRunLoadingWrapper id={id()} />}
				</Show>
			</ContentWrapper>
		</RunStoresProvider>
	);
}
