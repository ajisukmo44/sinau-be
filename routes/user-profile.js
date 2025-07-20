const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userProfileController = require("../controllers/userProfileController");
const itemsRouter = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log('users route middleware');
  next();
});

// user profile login get data by token
router.patch("/change-password", authenticateToken, userProfileController.changePassword);
router.put("/edit", authenticateToken, userProfileController.updateUserProfile);
router.patch("/change-avatar", authenticateToken, userProfileController.updatePicture);

module.exports = router;