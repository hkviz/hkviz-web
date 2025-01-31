import { redirect } from '@solidjs/router';

export function GET() {
	return redirect('/guide/install');
}
