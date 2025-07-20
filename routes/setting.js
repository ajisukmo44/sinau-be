const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const settingController = require("../controllers/admin/settingController");
const itemsRouter = express.Router();

// Middleware specific to this route
router.use((req, res, next) => {
  console.log('catalog route middleware');
  next();
});

// Crud setting application
router.get("/", authenticateToken, settingController.getSetting);
router.get("/:id", authenticateToken, settingController.getSettingsDetail);
router.post("/", authenticateToken, settingController.addSettings);
router.put("/:id", authenticateToken, settingController.updateSettingData); 
router.delete("/:id", authenticateToken, settingController.deleteSetting);

module.exports = router;