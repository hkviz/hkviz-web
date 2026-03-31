import { redirect } from '~/lib/routing/redirect';

export function GET() {
	return redirect('/guide/install');
}
