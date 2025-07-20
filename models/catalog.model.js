const express = require('express');
const pool = require('../config/pg');

const nDate = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Jakarta'
});

// catalog crud 
async function getAllCatalog() {
  const res = await pool.query('SELECT * FROM catalog  WHERE is_deleted = false ORDER BY category DESC');
  return res.rows;
};

async function addCatalog(data) {
  const res = await pool.query('INSERT INTO catalog (image, name, category, price, description, is_deleted, created_at) VALUES ($1, $2, $3, $4,  $5, $6, $7) RETURNING *', [data.image, data.name, data.category, data.price, data.description, data.is_deleted, nDate]);
  return res.rows[0];
};

async function getCatalogById(id) {
  const res = await pool.query('SELECT * FROM catalog WHERE id = $1', [id]);
  return res.rows[0];
};

async function updateCatalog(id, catalog) {
  let query = 'UPDATE catalog SET ';
  let values = [];
  let paramCount = 1;

  if (catalog.image !== undefined) {
    query += `image = $${paramCount}, `;
    values.push(catalog.image);
    paramCount++;
  }

  query += `name = $${paramCount}, category = $${paramCount + 1}, price = $${paramCount + 2}, description = $${paramCount + 3}, updated_at = $${paramCount + 4} WHERE id = $${paramCount + 5} RETURNING *`;
  values.push(catalog.name, catalog.category, catalog.price, catalog.description, nDate, id);

  const res = await pool.query(query, values);
  return res.rows[0];
};

async function deleteCatalog(id) {
  const res = await pool.query('UPDATE catalog SET is_deleted = true, deleted_at = $1 WHERE id = $2 RETURNING *', [nDate, id]);
  return res.rows;
};

module.exports = { getAllCatalog, addCatalog, deleteCatalog, getCatalogById, updateCatalog };