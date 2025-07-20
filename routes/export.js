const express = require('express');
const router = express.Router();
const pool = require('../config/pg');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const { authenticateToken } = require('../middleware/auth');

// Export to Excel
router.get('/excel', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, transaction_type } = req.query;
    let query = 'SELECT id, created_at AS date, order_number, transaction_type, customer_name, table_number, subtotal_group, tax, cash, cashback FROM transaction_group WHERE 1=1';
    const params = [];
    let paramIdx = 1;
    const moment = require('moment-timezone');
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
    if (transaction_type) {
      query += ` AND transaction_type = $${paramIdx}`;
      params.push(transaction_type);
      paramIdx++;
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    const data = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
      worksheet.addRows(data);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
});

// Export to CSV
// router.get('/csv', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM transaction_group ORDER BY created_at DESC');
//     const data = result.rows;
//     const parser = new Parser();
//     const csv = parser.parse(data);
//     res.header('Content-Type', 'text/csv');
//     res.attachment('transactions.csv');
//     res.send(csv);
//   } catch (err) {
//     res.status(500).json({ message: err.message, success: false });
//   }
// });

module.exports = router;
