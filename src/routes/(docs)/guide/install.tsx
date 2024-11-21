import { MdxInnerWrapper } from '~/components/mdx-layout';
import Mdx from './_install.mdx';
import { Title } from '@solidjs/meta';

export default function InstallGuidePage() {
	return (
		<MdxInnerWrapper>
			<Title>Install guide - HKViz</Title>
			<Mdx />
		</MdxInnerWrapper>
	);
}
