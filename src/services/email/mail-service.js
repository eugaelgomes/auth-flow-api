const nodemailer = require("nodemailer");

function MailService() {
  try {
    return nodemailer.createTransport({
      // Set your email service smtp settings
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } catch (error) {
    console.log("Mail service error: ", error);
    throw error;
  }
}

module.exports = { MailService };
