import { Title } from '@solidjs/meta';
import { RouteSectionProps, createAsync } from '@solidjs/router';
import { Show, createMemo } from 'solid-js';
import { ContentWrapper } from '~/components/content-wrapper';
import { RunCard } from '~/components/run-card';
import { GameplayDashboard, createRunFileLoader } from '~/lib/viz';
import { RunStoresProvider } from '~/lib/viz/store/store-context';
import { getRun } from '~/server/run/run-get';
import { getRunPageTitle } from './_metadata';

// TODO
// export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
//     const session = await getServerAuthSession();
//     return getRunMeta(params.id, session?.user?.id ?? null);
// }

export default function SingleRunPage(props: RouteSectionProps) {
	const id = () => props.params.id;

	const runData = createAsync(() => getRun(id()));

	const loader = createMemo(() => {
		const run = runData();
		if (!run) return null;
		return createRunFileLoader(run.files);
	});

	return (
		<RunStoresProvider>
			<ContentWrapper footerOutOfSight={true}>
				<Show when={runData()}>
					{(runData) => (
						<>
							<Title>{getRunPageTitle(runData())}</Title>
							<GameplayDashboard
								startDate={runData().startedAt}
								fileInfos={runData().files}
								runFileLoader={loader()!}
								gameplayCard={<RunCard run={runData()} showUser={true} />}
							/>
						</>
					)}
				</Show>
			</ContentWrapper>
		</RunStoresProvider>
	);
}
