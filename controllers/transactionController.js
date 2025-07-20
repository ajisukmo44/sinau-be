// create a handler for Transaction
const { getAllTransaction, addTransaction, getTransactionItemByGroupId, addTransactionItem, deleteTransaction, getTransactionById, updateTransaction } = require("../models/transaction.model.js");
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/pg');

exports.getTransaction = async (req, res, next) => {
  const { searchName, searchCategory } = req.query;
  let transactions = await getAllTransaction(searchName, searchCategory);
  try {
    console.log("Fetching items for user:", req);
    res.writeHead(200, { "Content-Type": "application/json" });
    const output = {
      message: "List of Transaction",
      data: transactions,
      count: transactions.length,
      status: "success",
    };
    res.write(JSON.stringify(output));
    res.end();

  } catch (err) {
    res.status(500).json({ message: err, success: false });
  }
}

exports.getTransactionDetail = async (req, res, next) => {
  const id = req.params.id;
  // res.json({id, success: true});
  try {
    const TransactionDetail = await getTransactionById(id);
    const TransactionItem = await getTransactionItemByGroupId(id);
    const output = {
      message: "Detail of Transaction",
      data: TransactionDetail,
      dataItem: TransactionItem,
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
    res.status(500).json({ message: err, success: false });
  }
  res.end();
}

exports.addTransactions = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const dateNow = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Jakarta'
  });
  try {
    const last_id = await pool.query('SELECT * FROM transaction_group ORDER BY id DESC');
    let idtrx = 0;
    if (last_id.rows && last_id.rows.length > 0 && last_id.rows[0].id) {
      idtrx = last_id.rows[0].id;
    }
    const newTransaction = {
      order_number: 'TRX-000' + (idtrx + 1),
      transaction_type: req.body.transaction_type,
      customer_name: req.body.customer_name,
      table_number: req.body.table_number,
      subtotal_group: req.body.subtotal_group,
      tax: req.body.tax,
      cash: req.body.cash,
      cashback: req.body.cashback,
      created_at: dateNow,
      items: req.body.items,
    };

    let result = await addTransaction(token, newTransaction);

    if (result) {
      const items = req.body.items;
      // Wait for all transaction items to be created
      await Promise.all(items.map(val => {
        const newTransactionItem = {
          "transaction_group_id": result?.id,
          "catalog_id": val.catalog_id,
          "quantity": val.quantity,
          "note": val.note,
          "subtotal": val.subtotal,
          "created_at": dateNow,
        };
        return addTransactionItem(newTransactionItem);
      }));
    }

    const TransactionItem = await getTransactionItemByGroupId(result?.id);

    const output = {
      message: "Transaction added successfully",
      data: result,
      dataItem: TransactionItem,
      status: "success",
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(output));
  } catch (err) {
    console.error("Error creating Transaction:", err);
    res.status(500).json({
      message: err.message || "Failed to create Transaction item",
      success: false
    });
  }
  res.end();
}

//  const addTransactionItemRun =  async (data) => {
//   if(data){
//     await addTransactionItem(data); 
//   }
// };

exports.deleteTransaction = async (req, res, next) => {
  const dateNow = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Jakarta'
  });
  const idd = req.params.id;
  const deleteTransactionx = await deleteTransaction(idd, dateNow);
  const output = {
    message: "Transaction deleted successfully",
    status: "success",
  };
  if (deleteTransactionx) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(output));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ error: "Transaction not found" }));
  }
  res.end();
};

exports.updateTransactionData = async (req, res) => {
  //
};

