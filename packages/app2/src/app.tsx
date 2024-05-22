import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import './app.css';
import { MainNav } from './components/main-nav/main-nav';

export default function App() {
    return (
        <Router
            root={(props) => (
                <div>
                    <MainNav session={null} theme={'dark'} />
                    <Suspense fallback="Loading Content">{props.children}</Suspense>
                </div>
            )}
        >
            <FileRoutes />
        </Router>
    );
}
