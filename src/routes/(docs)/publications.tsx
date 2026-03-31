import { Title } from '@solidjs/meta';
import { MdxInnerWrapper } from '~/components/mdx-layout';
import Mdx from './_publications.mdx';

export default function Publications() {
	return (
		<MdxInnerWrapper>
			<Title>Publications - HKViz</Title>
			<Mdx />
		</MdxInnerWrapper>
	);
}
