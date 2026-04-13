import '@fontsource-variable/cinzel/index.css';
import '@fontsource-variable/eb-garamond/index.css';
import '@fontsource-variable/noto-sans/index.css';
import '@fontsource/cinzel-decorative/latin-700.css';
import './app.css';

import { MetaProvider, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { ContentCenterWrapper } from './components/content-wrapper';
import { Footer } from './components/footer';
import { MainNav } from './components/main-nav/main-nav';
import { Toaster } from './components/ui/toast';
import { SessionProvider } from './lib/auth/client';
import { GlobalStoresProvider } from './lib/viz/store/store-context';

export default function App() {
	return (
		<Router
			root={(props) => (
				<GlobalStoresProvider>
					<SessionProvider>
						<MetaProvider>
							<Title>HKViz</Title>
							<MainNav />
							<Suspense fallback={<ContentCenterWrapper />}>{props.children}</Suspense>
							<Footer />
							<Toaster />
						</MetaProvider>
					</SessionProvider>
				</GlobalStoresProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
