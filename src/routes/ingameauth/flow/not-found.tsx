import { Title } from '@solidjs/meta';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export default function IngameAuthPage() {
	return (
		<ContentCenterWrapper>
			<Title>Login - HKViz</Title>
			<Card>
				<CardHeader>
					<CardTitle>This login link does not exist</CardTitle>
					<CardDescription>This might be because one of the following reasons:</CardDescription>
				</CardHeader>
				<CardContent>
					<ul class="list-inside list-disc text-sm text-muted-foreground">
						<li>The link was already used to login</li>
						<li>The link has expired (after 10 minutes)</li>
						<li>The link has never existed</li>
					</ul>
				</CardContent>
			</Card>
		</ContentCenterWrapper>
	);
}
