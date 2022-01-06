import { MailOptions } from "nodemailer/lib/json-transport";
import nodemailer from 'nodemailer'
import { Address } from "nodemailer/lib/mailer";
import path from "path";

const transportOptions = {
  name: process.env.MAILER_HOST,
  host: process.env.MAILER_HOST,
  port: Number(process.env.MAILER_PORT),
  secure: true,
  auth: {
    user: process.env.MAILER_SENDER_EMAIL,
    pass: process.env.MAILER_SENDER_PASSWORD
  },
}

const transporter = nodemailer.createTransport(transportOptions);

export const defaultMailOptions: MailOptions = {
  from: process.env.MAILER_SENDER,
};

interface RequiredEmailOptions {
  to: string | Address | Array<string | Address>;
  subject: string
  html: string | Buffer,
}

export const sendEmail = async (emailOptions: RequiredEmailOptions) => {
  try {
    const res = await transporter.sendMail({
      ...defaultMailOptions,
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html,
      attachments:[{
        filename: 'logo.jpg',
        path: path.join(__dirname, '../public/logo.jpg'),
        cid:'logo'
      }]
    });

    return res
  }
  catch (e) {
    throw e
  }
}
