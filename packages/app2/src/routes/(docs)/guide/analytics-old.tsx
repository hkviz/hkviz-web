import { A } from '@solidjs/router';

export default function APage() {
    return (
        <h1>
            B <A href="/guide/install">A</A>
        </h1>
    );
}
