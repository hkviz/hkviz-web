import { createTransport } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { env } from '~/env.mjs';

export const mailTransporter = createTransport({
    host: env.EMAIL_SERVER_HOST,
    port: env.EMAIL_SERVER_PORT,
    secureConnection: false, // TLS requires secureConnection to be false
    auth: {
        user: env.EMAIL_SERVER_USER,
        pass: env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
        ciphers: 'SSLv3',
    },
});

export function sendMailToSupport(options: Omit<Mail.Options, 'from' | 'to'>) {
    return mailTransporter.sendMail({
        ...options,
        from: `"HKViz Backend" <${env.EMAIL_FROM}>`,
        to: `"HKViz Support" <${env.EMAIL_FROM}>`,
    });
}
