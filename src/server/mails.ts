import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from '~/env';

interface SendMailOptions {
	to: string;
	from: string;
	subject: string;
	text: string;
	html?: string;
}

async function sendMail(options: SendMailOptions) {
	  // Check if running in development environment
  if ((import.meta as any).dev) {
    // Development: nodemailer
	  const nodemailer = await import('nodemailer');

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

	  const transporter = nodemailer.default.createTransport(transporterOptions);
	  return await transporter.sendMail({
		  from: options.from,
		  to: options.to,
		  subject: options.subject,
		  text: options.text,
		  html: options.html,
	  });
  } else {
    // Production: worker-mailer
    const { WorkerMailer } = await import('worker-mailer')
	  const mailer = await WorkerMailer.connect({
		  credentials: {
			  username: env.EMAIL_SERVER_USER,
			  password: env.EMAIL_SERVER_PASSWORD,
		  },
		  authType: 'plain',
		  host: env.EMAIL_SERVER_HOST,
		  port: env.EMAIL_SERVER_PORT,
		  secure: true,
	  });
	  return await mailer.send({
		  from: options.from,
		  to: options.to,
		  subject: options.subject,
		  text: options.text,
		  html: options.html,
	  });
  }
}

export function sendMailToSupport(options: Omit<SendMailOptions, 'from' | 'to'>) {
	return sendMail({
		...options,
		from: `"HKViz Backend" <${env.EMAIL_FROM}>`,
		to: `"HKViz Support" <${env.EMAIL_FROM}>`,
	});
}

export function sendMailToUser(options: Omit<SendMailOptions, 'from'>) {
	return sendMail({
		...options,
		from: `"HKViz Support" <${env.EMAIL_FROM}>`,
	});
}
