import { MdxInnerWrapper } from '~/components/mdx-layout';
import Mdx from './_changelog.mdx';
import { Title } from '@solidjs/meta';

export default function PrivacyPolicy() {
	return (
		<MdxInnerWrapper>
			<Title>Changelog - HKViz</Title>
			<Mdx />
		</MdxInnerWrapper>
	);
}
