const pool = require('../db/pool');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const create = async (username, password) => {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username`,
    [username, password_hash]
  );
  return rows[0];
};

const findByUsername = async (username) => {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );
  return rows[0] || null;
};

const findById = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT user_id, username FROM users WHERE user_id = $1`,
    [user_id]
  );
  return rows[0] || null;
};

const updatePassword = async (user_id, password) => {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query(
    `UPDATE users SET password_hash = $1 WHERE user_id = $2 RETURNING user_id, username`,
    [password_hash, user_id]
  );
  return rows[0] || null;
};

const deleteUser = async (user_id) => {
  const { rows } = await pool.query(
    `DELETE FROM users WHERE user_id = $1 RETURNING user_id, username`,
    [user_id]
  );
  return rows[0] || null;
};

module.exports = { create, findByUsername, findById, updatePassword, deleteUser };