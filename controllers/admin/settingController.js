// create a handler for Transaction
const  { getSetting, addSetting ,deleteSetting, updateSetting, getSettingByID }  = require("../../models/setting.model.js");
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const pool = require('../../config/pg.js');

exports.getSetting = async (req, res, next) => {
    try {
     let results = await getSetting();
      res.writeHead(200, { "Content-Type": "application/json" });
      const output = {
        message: "List of Setting",
        data: results,
        status: "success",
      };
      res.write(JSON.stringify(output));
      res.end();

    } catch (err) {
    res.status(500).json({message: err, success: false});
    }
}


exports.addSettings = async (req, res, next) => {
  try {
   const newSetting = {
     key: req.body.key,
     value: req.body.value,
   };
 
   let result = await addSetting(newSetting); 
   const output = {
     message: "Setting added successfully",
     data: result,
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
};

exports.getSettingsDetail = async (req, res, next) => {
  const id = req.params.id;
  let settingDetail = await getSettingByID(id);
  try {
    res.writeHead(200, { "Content-Type": "application/json" });
    const output = {
      message: "List of detail setting",
      data: settingDetail,
      status: "success",
    };
    res.write(JSON.stringify(output));
    res.end();

  } catch (err) {
  res.status(500).json({message: err, success: false});
  }
}

exports.updateSettingData = async (req, res, next) => {
  const id = req.params.id;
  try {
   const newSetting = {
     key: req.body.key,
     value: req.body.value,
   };
 
   let result = await updateSetting(id, newSetting); 
   const output = {
     message: "Setting added successfully",
     data: result,
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
};

exports.deleteSetting =  async (req, res, next) => {
  const idd = req.params.id;
  const deleteSet = await deleteSetting(idd);
  const output = {
    message: "Setting deleted successfully",
    status: "success",
  };
  if (deleteSet) {
    res.writeHead(200, { "Content-Type": "application/json" }); // No Content
    res.write(JSON.stringify(output));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ error: "Setting not found" }));
  }
  res.end();
};





