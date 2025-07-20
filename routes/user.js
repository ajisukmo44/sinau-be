const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userController = require("../controllers/admin/userController");
const itemsRouter = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log('users route middleware');
  next();
});

// Crud all users
router.get("/", authenticateToken, userController.getUser);
router.get("/:id", authenticateToken, userController.getUserDetail);
router.post("/", authenticateToken, userController.addUsers);
router.put("/:id", authenticateToken, userController.updateUserData); // Update a todo by ID
router.delete("/:id", authenticateToken, userController.deleteUser);

module.exports = router;