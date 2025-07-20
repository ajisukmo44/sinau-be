const express = require('express');
const pool = require('../config/pg');

async function getAllProduct() {
  const res = await pool.query('SELECT * FROM transaction_group');
  return res.rows;
};

async function addProduct(data) {
  const res = await pool.query('INSERT INTO product (name, price, deskripsi, category) VALUES ($1, $2, $3, $4) RETURNING *', [data.name, data.price, data.deskripsi, data.category]);
  return res.rows[0];
};


async function getProductById(id) {
  const res = await pool.query('SELECT * FROM product WHERE product_id = $1', [id]);
  return res.rows[0];
};


async function updateProduct(id, product) {
  const res = await pool.query('UPDATE product SET name = $1, price = $2, deskripsi = $3, category = $4 WHERE product_id = $5 RETURNING *', [product.name, product.price, product.deskripsi, product.category, id]);
  return res.rows[0];
};

async function deleteProduct(id) {
  const res = await pool.query('DELETE FROM product WHERE product_id = $1 RETURNING *', [id]);
  return res.rows[0];
};

module.exports = { getAllProduct, addProduct, deleteProduct, getProductById, updateProduct };