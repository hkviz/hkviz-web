import { Title } from '@solidjs/meta';
import { MdxInnerWrapper } from '~/components/mdx-layout';
import Mdx from './_install-guide.mdx';

export default function InstallGuidePage() {
	return (
		<MdxInnerWrapper>
			<Title>Gameplay Recording Guide - HKViz</Title>
			<Mdx />
		</MdxInnerWrapper>
	);
}
