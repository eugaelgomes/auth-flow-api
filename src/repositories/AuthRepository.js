const { executeQuery } = require("@/services/db/db-connection");

class AuthRepository {
  async findUserByUsername(username) {
    const query = `
      SELECT user_db_id, user_uid, full_name, email, password, role_id 
      FROM users 
      WHERE username = $1 OR email = $1
      LIMIT 1
    `;
    const results = await executeQuery(query, [username]);
    return results[0];
  }

  async logUserLocation(userId, ip, timestamp, location, userAgent) {
    const query = `
      INSERT INTO user_location_logs (user_id, ip_address, created_at, location, user_agent) 
      VALUES ($1, $2, $3, $4, $5)
    `;
    return await executeQuery(query, [
      userId,
      ip,
      timestamp,
      location,
      userAgent,
    ]);
  }
}

module.exports = new AuthRepository();
