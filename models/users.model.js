const express = require('express');
const pool = require('../config/pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const nDate = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Jakarta'
});

const JWT_SECRET = 'your-secret-key-change-in-production';

// user crud 
async function getAllUser() {
  const res = await pool.query('SELECT * FROM users ORDER BY id');
  return res.rows;
};

async function addUser(data) {
  const res = await pool.query('INSERT INTO users (avatar, role, name, username, email, status, password, language, created_at) VALUES ($1, $2, $3, $4,  $5, $6, $7, $8, $9) RETURNING *', [data.avatar, data.role, data.name, data.username, data.email, data.status, data.password, data.language, nDate]);
  return res.rows[0];
};

async function getUserById(id) {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0];
};

async function updateUser(id, user) {
  let query = 'UPDATE users SET ';
  let values = [];
  let paramCount = 1;

  if (user.avatar !== undefined) {
    query += `avatar = $${paramCount}, `;
    values.push(user.avatar);
    paramCount++;
  }

  query += `name = $${paramCount}, username = $${paramCount + 1}, email = $${paramCount + 2}, status = $${paramCount + 3}, role = $${paramCount + 4}, language = $${paramCount + 5}, updated_at = $${paramCount + 6} WHERE id = $${paramCount + 7} RETURNING *`;
  values.push(user.name, user.username, user.email, user.status, user.role, user.language, nDate, id);

  const res = await pool.query(query, values);
  return res.rows[0];
};

async function deleteUser(id) {
  const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return res.rows;
};

// user profile
async function updateProfileUser(token, user) {
  const decoded = jwt.verify(token, JWT_SECRET);
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
  const userID = userResult.rows[0].id;

  let query = 'UPDATE users SET ';
  let values = [];
  let paramCount = 1;

  query += `name = $${paramCount}, username = $${paramCount + 1}, email = $${paramCount + 2}, language = $${paramCount + 3}, updated_at = $${paramCount + 4} WHERE id = $${paramCount + 5} RETURNING *`;
  values.push(user.name, user.username, user.email, user.language, nDate, userID);

  const res = await pool.query(query, values);
  return res.rows[0];
};

async function updatePasswordUser(token, user) {
  const decoded = jwt.verify(token, JWT_SECRET);
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
  const userID = userResult.rows[0].id;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);

  let query = 'UPDATE users SET ';
  let values = [];
  let paramCount = 1;

  query += `password = $${paramCount}, updated_at = $${paramCount + 1} WHERE id = $${paramCount + 2} RETURNING *`;
  values.push(hashedPassword, nDate, userID);

  const res = await pool.query(query, values);
  return res.rows[0];
};

async function updateAvatar(token, avatar) {
  const decoded = jwt.verify(token, JWT_SECRET);
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
  const userID = userResult.rows[0].id;

  const res = await pool.query('UPDATE users SET avatar = $1 WHERE id = $2 RETURNING *', [avatar.image, userID]);
  return res.rows[0];
};


module.exports = { getAllUser, addUser, deleteUser, getUserById, updateUser, updateProfileUser, updatePasswordUser, updateAvatar };