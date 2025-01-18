import { createTransport } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from '~/env';

const transporterOptions: SMTPTransport.Options = {
	host: env.EMAIL_SERVER_HOST,
	port: env.EMAIL_SERVER_PORT,
	auth: {
		user: env.EMAIL_SERVER_USER,
		pass: env.EMAIL_SERVER_PASSWORD,
	},
	tls: {
		ciphers: 'SSLv3',
	},
};

export const mailTransporter = createTransport(transporterOptions);

export function sendMailToSupport(options: Omit<Mail.Options, 'from' | 'to'>) {
	return mailTransporter.sendMail({
		...options,
		from: `"HKViz Backend" <${env.EMAIL_FROM}>`,
		to: `"HKViz Support" <${env.EMAIL_FROM}>`,
	});
}

export function sendMailToUser(options: Omit<Mail.Options, 'from'>) {
	return mailTransporter.sendMail({
		...options,
		from: `"Oliver from HKViz" <${env.EMAIL_FROM}>`,
	});
}
