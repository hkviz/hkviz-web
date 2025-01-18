// @refresh reload
import { mount, StartClient } from '@solidjs/start/client';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// import 'solid-devtools';

inject();
injectSpeedInsights();

mount(() => <StartClient />, document.getElementById('app')!);
