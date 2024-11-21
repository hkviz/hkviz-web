import { MdxInnerWrapper } from '~/components/mdx-layout';
import Mdx from './_privacy-policy.mdx';
import { Title } from '@solidjs/meta';

export default function PrivacyPolicy() {
	return (
		<MdxInnerWrapper>
			<Title>Privacy Policy - HKViz</Title>
			<Mdx />
		</MdxInnerWrapper>
	);
}
