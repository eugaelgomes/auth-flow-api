const { executeQuery } = require("@/services/db/db-connection");

class PasswordRepository {
  async findUserByEmail(email) {
    const query = "SELECT email FROM users WHERE LOWER(email) = LOWER($1)";
    const results = await executeQuery(query, [email]);
    return results[0];
  }

  async deactivateOldTokens(userId) {
    const query =
      "UPDATE tokens SET active = FALSE WHERE user_id = $1 AND active = TRUE";
    return await executeQuery(query, [userId]);
  }

  async createToken(userId, token, createdAt) {
    const query =
      "INSERT INTO tokens (user_id, token, created_at, active) VALUES ($1, $2, $3, TRUE)";
    return await executeQuery(query, [userId, token, createdAt]);
  }

  async findTokenByValue(token) {
    const query = "SELECT * FROM tokens WHERE token = $1";
    const results = await executeQuery(query, [token]);
    return results[0];
  }

  async updateUserPassword(email, hashedPassword) {
    const query = "UPDATE users SET password = $1 WHERE email = $2";
    return await executeQuery(query, [hashedPassword, email]);
  }

  async deleteToken(token) {
    const query = "DELETE FROM tokens WHERE token = $1";
    return await executeQuery(query, [token]);
  }
}

module.exports = new PasswordRepository();
