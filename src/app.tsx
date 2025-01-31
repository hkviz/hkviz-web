import { MetaProvider, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import './app.css';
import { ContentCenterWrapper } from './components/content-wrapper';
import { Footer } from './components/footer';
import { MainNav } from './components/main-nav/main-nav';
import { Toaster } from './components/ui/toast';
import { SessionProvider } from './lib/auth/client';
import { GlobalStoresProvider } from './lib/viz/store/store-context';

// function Error(props: any) {
// 	console.log(props);
// 	return (
// 		<ContentCenterWrapper>
// 			<div class="container flex flex-col items-center justify-center gap-12 px-4 py-16">
// 				<h1 class="mb-4 pl-2 text-center font-serif text-3xl font-semibold">An error occurred</h1>
// 				<p class="text-center">Please refresh the page or try again later</p>
// 			</div>
// 		</ContentCenterWrapper>
// 	);
// }

export default function App() {
	return (
		<Router
			root={(props) => (
				// <ErrorBoundary fallback={(error) => <Error error={error} />}>
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
				// </ErrorBoundary>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
