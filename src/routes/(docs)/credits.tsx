import { Title } from '@solidjs/meta';
import { MdxInnerWrapper } from '../../components/mdx-layout';
import Mdx from './_credits.mdx';

export default function Credits() {
	return (
		<MdxInnerWrapper>
			<Title>Credits - HKViz</Title>
			<Mdx />
		</MdxInnerWrapper>
	);
}
