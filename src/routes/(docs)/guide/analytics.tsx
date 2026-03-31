import { Title } from '@solidjs/meta';
import { MdxInnerWrapper } from '~/components/mdx-layout';
import Mdx from './_analytics.mdx';

export default function AnalyticsGuidePage() {
	return (
		<MdxInnerWrapper>
			<Title>Analytics Guide - HKViz</Title>
			<Mdx />
		</MdxInnerWrapper>
	);
}
