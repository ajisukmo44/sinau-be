// create a handler for user
const { updateProfileUser, updatePasswordUser, updateAvatar } = require("../models/users.model.js");
const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const express = require('express');
const bcrypt = require('bcryptjs');

const saltRounds = 10;

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/users';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation schema for user
const userSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  username: Joi.string().required().min(0),
  email: Joi.string().email(),
  language: Joi.string().max(100),
});

const passwordSchema = Joi.object({
  password: Joi.string().required().min(6).max(255),
});

exports.updatePicture = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Use multer middleware for single image upload
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
        success: false
      });
    }

    try {
      const updateData = {
        image: req.file ? req.file.filename : undefined // Only update image if new file is uploaded
      };

      const updateAva = await updateAvatar(token, updateData);

      if (!updateAva) {
        return res.status(404).json({
          message: "User not found",
          success: false
        });
      }

      const output = {
        message: "User updated successfully",
        data: {
          image_url: req.file.filename
        },
        status: "success",
      };

      res.json(output);
    } catch (err) {
      console.error("Error updating user:", err);
      // If file was uploaded but database operation failed, delete the file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        message: err.message || "Failed to update user item",
        success: false
      });
    }
  });
};


exports.updateUserProfile = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Use multer middleware for single image upload
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
        success: false
      });
    }

    try {
      // Validate request body
      const { error, value } = userSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          success: false
        });
      }

      const updateData = {
        ...value
      };

      const updatedUser = await updateProfileUser(token, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found",
          success: false
        });
      }

      const output = {
        message: "User updated successfully",
        data: {
          ...updatedUser,
        },
        status: "success",
      };

      res.json(output);
    } catch (err) {
      console.error("Error updating user:", err);
      // If file was uploaded but database operation failed, delete the file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        message: err.message || "Failed to update user item",
        success: false
      });
    }
  });
};

exports.changePassword = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    // Validate request body
    const { error, value } = passwordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false
      });
    }

    const updateData = {
      password: value.password
    };

    const updatedUserPassword = await updatePasswordUser(token, updateData);

    if (!updatedUserPassword) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }
    const user_res = {
      'name': updatedUserPassword.name,
      'username': updatedUserPassword.username,
      'email': updatedUserPassword.email,
      'role': updatedUserPassword.originalname
    }

    const output = {
      message: "User password updated successfully",
      data: user_res,
      status: "success",
    };

    res.json(output);

  } catch (err) {
    console.error("Error updating user:", err);
    // If file was uploaded but database operation failed, delete the file
    res.status(500).json({
      message: err.message || "Failed to update user item",
      success: false
    });
  }
};

