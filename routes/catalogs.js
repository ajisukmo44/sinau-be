const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const catalogController = require("../controllers/catalogController");
const itemsRouter = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log('catalog route middleware');
  next();
});

// Crud master catalogs
router.get("/", authenticateToken, catalogController.getCatalog);
router.get("/:id", authenticateToken, catalogController.getCatalogDetail);
router.post("/", authenticateToken, authorizeAdmin, catalogController.addCatalogs);
router.put("/:id", authenticateToken, authorizeAdmin, catalogController.updateCatalogData); // Update a todo by ID
router.delete("/:id", authenticateToken, authorizeAdmin, catalogController.deleteCatalog);

module.exports = router;