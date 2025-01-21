import { ClientRedirect } from './_redirect';

export const metadata = {
    title: 'Install guide - HKViz',
    alternates: {
        canonical: '/guides/install',
    },
};

export const runtime = 'edge';

export default function Page() {
    return <ClientRedirect />;
}
