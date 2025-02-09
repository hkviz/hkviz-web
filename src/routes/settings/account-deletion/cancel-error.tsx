import { ContentCenterWrapper } from '~/components/content-wrapper';
import { MailLink } from '~/components/mail-link';
import { Card, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export default function AccountDeletionPage() {
	return (
		<ContentCenterWrapper>
			<Card>
				<CardHeader>
					<CardTitle>Account deletion cancellation failed!</CardTitle>
					<CardDescription>
						Please contact our support via <MailLink /> for assistance if required.
					</CardDescription>
				</CardHeader>
			</Card>
		</ContentCenterWrapper>
	);
}
