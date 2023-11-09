import { getServerAuthSession } from '~/server/auth';
import { AuthNeeded } from '../_components/auth-needed';
import { MainContentWrapper } from '../_components/main-content-wrapper';
import { UploadForm } from '../_components/upload-form';

export default async function Upload() {
    // const hello = await api.post.hello.query({ text: "from tRPC" });
    const session = await getServerAuthSession();

    if (!session) {
        return <AuthNeeded />;
    }

    return (
        <MainContentWrapper>
            <div className="container flex flex-col items-center justify-center gap-4">
                {/* <h1 className="text-4xl font-extrabold tracking-tight">Upload a HollowKnight run</h1> */}
                <UploadForm />
            </div>
        </MainContentWrapper>
    );
}
