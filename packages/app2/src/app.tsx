import { SessionProvider } from '@solid-mediakit/auth/client';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import './app.css';
import { MainNav } from './components/main-nav/main-nav';
import { Footer } from './components/footer';

export default function App() {
    return (
        <Router
            explicitLinks
            root={(props) => (
                <div>
                    <Suspense fallback="Loading Content">
                        <SessionProvider>
                            <MainNav theme={'dark'} />
                            {props.children}
                            <Footer />
                        </SessionProvider>
                    </Suspense>
                </div>
            )}
        >
            <FileRoutes />
        </Router>
    );
}
