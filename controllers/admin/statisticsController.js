// create a handler for Transaction
const  { getSummaryOrder, getOmzet, getMenuOrder, getMenuOrderItem, getMenuOrderItemDetail, getDailyChartCategoryOrder }  = require("../../models/statistics.model.js");
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const pool = require('../../config/pg.js');

exports.getSummary = async (req, res, next) => {
    // const Transaction = await pool.query('SELECT * FROM transaction');
    let orderTotal = await getSummaryOrder();
    let omzetData = await getOmzet();
    let menuOrder = await getMenuOrder();
    let menuCategoryOrder = await getMenuOrderItem();
    try {
      function getCategoryTotal(category) {
        const found = menuCategoryOrder.find((cat) => cat.category == category);
        return found && found.total_item_category ? found.total_item_category : 0;
      }
      const output = {
        message: "List of Summary",
        data: {
          total_order : orderTotal.length,
          total_omzet : omzetData.total_omzet,
          total_menu : menuOrder.total_menu_order,
          total_beverages : getCategoryTotal('beverages'),
          total_desserts : getCategoryTotal('desserts'),
          total_foods : getCategoryTotal('foods'),
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

exports.getSummaryDetail = async (req, res, next) => {
    const id = req.params.id;
    let menuDetailOrder = await getMenuOrderItemDetail(id);
    try {
      res.writeHead(200, { "Content-Type": "application/json" });
      const output = {
        message: "List of detail category order",
        data: menuDetailOrder,
        status: "success",
      };
      res.write(JSON.stringify(output));
      res.end();

    } catch (err) {
    res.status(500).json({message: err, success: false});
    }
}


exports.getDailyChartOrderCategory = async (req, res, next) => {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate
    let menuDetailOrder = await getDailyChartCategoryOrder(startDate, endDate);
    try {
      res.writeHead(200, { "Content-Type": "application/json" });
      const output = {
        message: "List of daily chart",
        data: menuDetailOrder,
        status: "success",
      };
      res.write(JSON.stringify(output));
      res.end();

    } catch (err) {
    res.status(500).json({message: err, success: false});
    }
}





