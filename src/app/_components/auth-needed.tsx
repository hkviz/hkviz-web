import { MainContentWrapper } from './main-content-wrapper';

export function AuthNeeded() {
    return (
        <MainContentWrapper>
            <p>
                This page requires authentication. Please <a href="/api/auth/signin">sign in</a> to continue.
            </p>
        </MainContentWrapper>
    );
}
