import nodemailer from "nodemailer";

export function MailService() {
  try {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOSTNAME,
      port: 465,
      secure: true, // em vez de secureConnection
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } catch (error) {
    console.error("Falha ao criar servidor de e-mails:", error);
    throw error;
  }
}
