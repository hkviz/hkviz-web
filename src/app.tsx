import { MetaProvider, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import './app.css';
import { MainNav } from './components/main-nav/main-nav';
import { SessionProvider } from './lib/auth/client';
import { Toaster } from './components/ui/toast';
import { Footer } from './components/footer';

export default function App() {
	return (
		<Router
			root={(props) => (
				<SessionProvider>
					<MetaProvider>
						<Title>HKViz</Title>
						<MainNav theme={'dark'} />
						<Suspense>{props.children}</Suspense>
						<Footer />
						<Toaster />
					</MetaProvider>
				</SessionProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
