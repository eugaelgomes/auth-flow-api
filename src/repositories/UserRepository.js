/* eslint-disable quotes */
const { executeQuery } = require("@/services/db/db-connection");

class UserRepository {
  async findAll() {
    const query = `SELECT full_name, email, phone, username FROM users`;
    return await executeQuery(query);
  }

  async findByUsernameOrEmail(username, email) {
    const query = `SELECT * FROM users WHERE email = $1 OR username = $2`;
    return await executeQuery(query, [email, username]);
  }

  async findById(userId) {
    const query = `SELECT user_db_id, username, full_name FROM users WHERE user_db_id = $1 LIMIT 1`;
    const results = await executeQuery(query, [userId]);
    return results[0];
  }

  async findByGithubId(githubId) {
    const query = `SELECT user_db_id, username, full_name FROM users WHERE github_id = $1 LIMIT 1`;
    const results = await executeQuery(query, [githubId]);
    return results[0];
  }

  async createUser(userUid, name, email, username, password, createdAt) {
    const query = `
      INSERT INTO users (user_uid, full_name, email, username, password, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_db_id
    `;
    return await executeQuery(query, [
      userUid,
      name,
      email,
      username,
      password,
      createdAt,
    ]);
  }

  async createGithubUser(username, name, githubId) {
    const query = `
      INSERT INTO users (username, full_name, github_id) 
      VALUES ($1, $2, $3)
      RETURNING user_db_id
    `;
    return await executeQuery(query, [username, name, githubId]);
  }
}

module.exports = new UserRepository();
