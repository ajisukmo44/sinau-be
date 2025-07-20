const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeCashier, authorizeAdmin } = require('../middleware/auth');
const transactionController = require("../controllers/transactionController");
const itemsRouter = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log('Product route middleware');
  next();
});

// Crud Transaction Order
router.get("/", authenticateToken, transactionController.getTransaction);
router.get("/:id", authenticateToken, transactionController.getTransactionDetail);
router.post("/", authenticateToken, authorizeCashier, transactionController.addTransactions);
router.put("/:id", authenticateToken, authorizeCashier, transactionController.updateTransactionData);
router.delete("/:id", authenticateToken, authorizeAdmin, transactionController.deleteTransaction);

module.exports = router;