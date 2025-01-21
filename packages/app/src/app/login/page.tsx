import type { Metadata } from 'next';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { HKVizText } from '../_components/hkviz-text';

export function generateMetadata(): Metadata {
    return {
        title: 'Login - HKViz',
    };
}

export default function LoginPage() {
    return (
        <ContentCenterWrapper>
            <div className="max-w-[70ch]">
                <h1 className="font-serif text-3xl font-semibold">Login not supported</h1>
                <p>
                    The archived version of <HKVizText /> does not support the login. To login, visit{' '}
                    <a href="https://www.hkviz.org" className="underline">
                        the latest version of <HKVizText />
                    </a>
                </p>
            </div>
        </ContentCenterWrapper>
    );
}
