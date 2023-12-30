import { MdxInnerWrapper, MdxOuterWrapper } from '../_components/mdx-layout';
import Mdx from './_page.mdx';

export default function Credits() {
    return (
        <MdxOuterWrapper>
            <MdxInnerWrapper className="my-[4rem]">
                <Mdx />
            </MdxInnerWrapper>
        </MdxOuterWrapper>
    );
}
