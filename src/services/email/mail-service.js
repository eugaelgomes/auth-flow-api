const nodemailer = require("nodemailer");

function MailService() {
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
    console.error("Fail to create email transport:", error);
    throw error;
  }
}

module.exports = { MailService };
