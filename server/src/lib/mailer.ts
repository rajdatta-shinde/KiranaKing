import nodemailer from "nodemailer";

/** Brevo (Sendinblue) SMTP transport. */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const from = `"${process.env.SENDER_NAME || "KiranaKing"}" <${
    process.env.SENDER_EMAIL || "no-reply@kiranaking.app"
  }>`;
  return transporter.sendMail({ from, to, subject, html });
}

export default transporter;
