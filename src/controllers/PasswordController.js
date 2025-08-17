const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const PasswordRepository = require("@/repositories/PasswordRepository");
const mail_rescue_pass = require("@/services/email/token/mail-sender");

const call_help_url = "https://app.codaweb.com.br/auth/forget-password";

const getCurrentDateTimeUTCMinus3 = () => {
  const date = new Date();
  date.setHours(date.getHours() - 3);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

class PasswordController {
  async forgotPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Invalid email", errors: errors.array() });
    }

    const email = req.body.email;

    try {
      console.log(`Verifying email existence: ${email}`);
      const userExists = await PasswordRepository.findUserByEmail(email);

      if (!userExists) {
        return res.status(400).json({ message: "User not found." });
      }

      const token = crypto.randomBytes(10).toString("hex");
      const currentDateTime = getCurrentDateTimeUTCMinus3();

      // Desativa tokens antigos
      await PasswordRepository.deactivateOldTokens(email);

      // Insere novo token
      await PasswordRepository.createToken(email, token, currentDateTime);

      // Envia o email com o token
      const emailResult = await mail_rescue_pass(email, token);

      if (!emailResult.success) {
        return res.status(500).json({
          message: "Error sending email. Please try again.",
        });
      }

      return res.status(200).json({
        message: "Recovery instructions sent to your email.",
      });
    } catch (error) {
      console.error("Error recovering password:", error);
      return res.status(500).json({
        message: "Error processing request. Please try again later.",
      });
    }
  }

  async resetPassword(req, res) {
    console.log("=== STARTING PASSWORD RESET PROCESS ===");
    const { token, password: newPassword } = req.body;

    if (!token || !newPassword) {
      console.log("ERROR: Token or password not provided");
      return res.status(400).json({
        message: "Token and new password are required",
        received: {
          token: !!token,
          password: !!newPassword,
        },
      });
    }

    try {
      const tokenRecord = await PasswordRepository.findTokenByValue(token);
      console.log(
        "Token query result:",
        tokenRecord ? "Token found" : "Token not found"
      );

      if (!tokenRecord) {
        console.log("ERROR: Invalid or non-existent token");
        return res.status(400).json({
          message: `Invalid token, please try again ${call_help_url}`,
        });
      }

      const email = tokenRecord.email;
      console.log("Email associated with token:", email);

      const userExists = await PasswordRepository.findUserByEmail(email);
      console.log(
        "User query result:",
        userExists ? "User found" : "User not found"
      );

      if (!userExists) {
        console.log("ERROR: Email not found in database");
        return res.status(400).json({
          message: "Email not found.",
        });
      }

      console.log("Generating hash for new password");
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log("Hash generated successfully");

      console.log("Updating user password");
      await PasswordRepository.updateUserPassword(email, hashedPassword);
      console.log("Password updated successfully");

      console.log("Removing used token from database");
      await PasswordRepository.deleteToken(token);
      console.log("Token removed successfully");

      console.log("=== PASSWORD RESET COMPLETED SUCCESSFULLY ===");
      return res.status(200).json({
        message: "Password updated successfully!",
      });
    } catch (error) {
      console.error("ERROR during password reset:", error);
      return res.status(500).json({
        message: "Error processing request",
        error: error.message,
      });
    }
  }
}

module.exports = new PasswordController();
