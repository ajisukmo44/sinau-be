// create a handler for Transaction
const  { getSalesReport, getSalesReportCount, getTransactionById, getTransactionItemByGroupId  }  = require("../../models/transaction.model.js");
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const pool = require('../../config/pg.js');

exports.getReportSales = async (req, res, next) => {
    const { startDate, endDate, transaction_type } = req.query;
    let limit = parseInt(req.query.limit, 10) || 10;
    let page = parseInt(req.query.page, 10) || 1;
    let baseUrl = req.baseUrl + req.path;
    try {
      const [salesReport, total] = await Promise.all([
        getSalesReport(startDate, endDate, transaction_type, limit, page),
        getSalesReportCount(startDate, endDate, transaction_type)
      ]);
      const totalPages = Math.ceil(total / limit);
      const makeLink = (pageNum) => {
        const params = new URLSearchParams({ ...req.query, limit, page: pageNum });
        return `${baseUrl}?${params.toString()}`;
      };
      const output = {
        message: "List of Transaction",
        data: salesReport,
        pagination: {
          page,
          pageSize: limit,
          total,
          totalPages,
          next: page < totalPages ? makeLink(page + 1) : null,
          prev: page > 1 ? makeLink(page - 1) : null
        },
        status: "success",
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(output));
      res.end();
    } catch (err) {
      res.status(500).json({message: err, success: false});
    }
}

exports.getReportSalesDetail = async (req, res, next) => {
  // const Transaction = await pool.query('SELECT * FROM transaction');
  const id = req.params.id;
  // res.json({id, success: true});
  try {
  const TransactionDetail = await getTransactionById(id);
  const TransactionItem = await getTransactionItemByGroupId(id);
  const output = {
    message: "Detail of Transaction",
    data: TransactionDetail,
    dataItem : TransactionItem,
    status: "success",
  };
  if (TransactionDetail) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(output));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ error: "Transaction not found" }));
  }
} catch (err) {
  res.status(500).json({message: err, success: false});
  }
  res.end();
   
}


