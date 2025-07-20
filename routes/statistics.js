const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const statisticController = require("../controllers/admin/statisticsController");
const itemsRouter = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log('statistics route middleware');
  next();
});

// Get all statistics dashboard
router.get("/", authenticateToken, statisticController.getSummary);
router.get("/:id", authenticateToken, statisticController.getSummaryDetail);
router.post("/daily-chart", authenticateToken, authorizeAdmin, statisticController.getDailyChartOrderCategory);

module.exports = router;