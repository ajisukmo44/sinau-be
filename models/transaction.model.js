const express = require('express');
const pool = require('../config/pg');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const JWT_SECRET = 'your-secret-key-change-in-production';

// Transaction crud 
async function getAllTransaction(searchName, searchCategory) {
  let query = 'SELECT * FROM transaction_group WHERE is_deleted = FALSE';
  const params = [];
  let paramIdx = 1;

  if (searchName) {
    query += ` AND customer_name ILIKE $${paramIdx}`;
    params.push(`%${searchName}%`);
    paramIdx++;
  }

  if (searchCategory) {
    query += ` AND transaction_type ILIKE $${paramIdx}`;
    params.push(`%${searchCategory}%`);
    paramIdx++;
  }

  query += ' ORDER BY created_at DESC';
  const res = await pool.query(query, params);
  return res.rows;
};

async function addTransaction(token, data) {
  const decoded = jwt.verify(token, JWT_SECRET);
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
  const userID = userResult.rows[0].id;

  const res = await pool.query('INSERT INTO transaction_group (user_id, order_number, transaction_type, customer_name, table_number, subtotal_group, tax, cash, cashback, created_at) VALUES ($1, $2, $3, $4,  $5, $6, $7, $8, $9, $10) RETURNING *', [userID, data.order_number, data.transaction_type, data.customer_name, data.table_number, data.subtotal_group, data.tax, data.cash, data.cashback, data.created_at]);
  return res.rows[0];
};

async function addTransactionItem(data) {
  const res = await pool.query('INSERT INTO transaction_item (transaction_group_id, catalog_id, note, quantity, subtotal, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [data.transaction_group_id, data.catalog_id, data.note, data.quantity, data.subtotal, data.created_at]);
  return res.rows[0];
};

async function getTransactionById(id) {
  const res = await pool.query('SELECT tg.*, u.name AS cashier_name, u.username AS cashier_username FROM transaction_group tg JOIN "users" u ON tg.user_id = u.id WHERE tg.id = $1', [id]);
  return res.rows[0];
};

async function getTransactionItemByGroupId(id) {
  const res = await pool.query('SELECT ti.*, c.name, c.price FROM transaction_item ti JOIN catalog c ON ti.catalog_id = c.id  WHERE transaction_group_id = $1', [id]);
  return res.rows;
};

async function updateTransaction(id, transaction) {
  let query = 'UPDATE transaction SET ';
  let values = [];
  let paramCount = 1;

  if (transaction.image !== undefined) {
    query += `image = $${paramCount}, `;
    values.push(Transaction.image);
    paramCount++;
  }

  query += `name = $${paramCount}, category = $${paramCount + 1}, price = $${paramCount + 2}, description = $${paramCount + 3}, updated_at = $${paramCount + 4} WHERE id = $${paramCount + 5} RETURNING *`;
  values.push(transaction.name, transaction.category, transaction.price, transaction.description, nDate, id);

  const res = await pool.query(query, values);
  return res.rows[0];
};

async function deleteTransaction(id, date) {
  const res = await pool.query('UPDATE transaction_group SET is_deleted = true, deleted_at = $1 WHERE id = $2 RETURNING *', [date, id]);
  return res.rows;
};


async function getSalesReport(startDate, endDate, transactionType, limit, page) {
  let query = 'SELECT * FROM transaction_group WHERE is_deleted = FALSE';
  const params = [];
  let paramIdx = 1;

  if (startDate) {
    query += ` AND created_at >= $${paramIdx}`;
    params.push(moment.tz(startDate, 'Asia/Jakarta').startOf('day').format('YYYY-MM-DD HH:mm:ss'));
    paramIdx++;
  }
  if (endDate) {
    query += ` AND created_at <= $${paramIdx}`;
    params.push(moment.tz(endDate, 'Asia/Jakarta').endOf('day').format('YYYY-MM-DD HH:mm:ss'));
    paramIdx++;
  }
  if (transactionType) {
    query += ` AND transaction_type = $${paramIdx}`;
    params.push(transactionType);
    paramIdx++;
  }
  query += ' ORDER BY created_at DESC';
  if (limit) {
    query += ` LIMIT $${paramIdx}`;
    params.push(parseInt(limit, 10));
    paramIdx++;
  }
  if (page && limit) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    query += ` OFFSET $${paramIdx}`;
    params.push(offset);
    paramIdx++;
  }
  const res = await pool.query(query, params);
  return res.rows;
};

async function getSalesReportCount(startDate, endDate, transactionType) {
  let query = 'SELECT COUNT(*) FROM transaction_group WHERE is_deleted = FALSE';
  const params = [];
  let paramIdx = 1;
  if (startDate) {
    query += ` AND created_at >= $${paramIdx}`;
    params.push(moment.tz(startDate, 'Asia/Jakarta').startOf('day').format('YYYY-MM-DD HH:mm:ss'));
    paramIdx++;
  }
  if (endDate) {
    query += ` AND created_at <= $${paramIdx}`;
    params.push(moment.tz(endDate, 'Asia/Jakarta').endOf('day').format('YYYY-MM-DD HH:mm:ss'));
    paramIdx++;
  }
  if (transactionType) {
    query += ` AND transaction_type = $${paramIdx}`;
    params.push(transactionType);
    paramIdx++;
  }
  const res = await pool.query(query, params);
  return parseInt(res.rows[0].count, 10);
}


module.exports = { getAllTransaction, addTransaction, addTransactionItem, deleteTransaction, getTransactionById, updateTransaction, getTransactionItemByGroupId, getSalesReport, getSalesReportCount };