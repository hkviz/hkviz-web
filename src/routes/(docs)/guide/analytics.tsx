import { MdxInnerWrapper } from '~/components/mdx-layout';
import Mdx from './_analytics.mdx';
import { Title } from '@solidjs/meta';

export default function AnalyticsGuidePage() {
	return (
		<MdxInnerWrapper>
			<Title>Analytics guide - HKViz</Title>
			<Mdx />
		</MdxInnerWrapper>
	);
}
