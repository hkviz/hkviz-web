import { Title } from '@solidjs/meta';
import { MdxInnerWrapper } from '~/components/mdx-layout';
import Mdx from './_research.mdx';

export default function Research() {
	return (
		<MdxInnerWrapper>
			<Title>Research - HKViz</Title>
			<Mdx />
		</MdxInnerWrapper>
	);
}
