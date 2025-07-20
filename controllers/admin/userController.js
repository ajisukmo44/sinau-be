// create a handler for user
const { getAllUser, addUser, deleteUser, getUserById, updateUser } = require("../../models/users.model.js");
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
  status: Joi.string().max(100),
  role: Joi.string().max(100),
  language: Joi.string().max(100),
  password: Joi.string().min(4).default(false)
});

exports.getUser = async (req, res, next) => {
  // const user = await pool.query('SELECT * FROM user');
  let filteredUser = await getAllUser();
  let users = await getAllUser();
  try {
    console.log("Fetching items for user:", req);

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filteredUser = users.filter(user => searchRegex.test(user.name));
    }

    const output = {
      message: "List of user",
      data: filteredUser,
      count: filteredUser.length,
      status: "success",
    };
    res.json(output);

  } catch (err) {
    res.status(500).json({ message: err, success: false });
  }
}

exports.getUserDetail = async (req, res, next) => {
  const id = req.params.id;
  // res.json({id, success: true});
  try {
    const userx = await getUserById(id);
    const output = {
      message: "Detail of user",
      data: userx,
      status: "success",
    };
    if (userx) {
      res.json(output);
    } else {
      res.status(404).json({ error: "user not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err, success: false });
  }
}

exports.addUsers = async (req, res, next) => {
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

      const hashedPassword = await bcrypt.hash(value.password, saltRounds);

      const newuser = {
        name: value.name,
        username: value.username,
        language: value.language,
        role: value.role,
        email: value.email || '',
        status: value.status,
        password: hashedPassword,
        avatar: req.file ? req.file.filename : null // Save filename to database
      };

      const createdUser = await addUser(newuser);
      const output = {
        message: "user added successfully",
        data: newuser,
        data: {
          ...createdUser,
          image_url: req.file ? `/uploads/users/${req.file.filename}` : null
        },
        status: "success",
      };

      res.status(201).json(output);
    } catch (err) {
      console.error("Error creating user:", err);
      // If file was uploaded but database operation failed, delete the file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        message: err.message || "Failed to create user item",
        success: false
      });
    }
  });
};

exports.updateUserData = async (req, res) => {
  const id = req.params.id;

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
        ...value,
        image: req.file ? req.file.filename : undefined
      };

      const updatedUser = await updateUser(id, updateData);

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
          image_url: req.file ? `/uploads/users/${req.file.filename}` : null
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

exports.deleteUser = async (req, res, next) => {
  const idd = req.params.id;

  const deleteUserx = await deleteUser(idd);
  const output = {
    message: "User deleted successfully",
    status: "success",
  };
  if (deleteUserx) {
    res.json(output);
  } else {
    res.status(404).json({ error: "User not found" });
  }
};

