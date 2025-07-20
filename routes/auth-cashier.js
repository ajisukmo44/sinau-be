const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/pg');

// JWT secret (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-change-in-production';

// Register new cashier user (connect to database)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email and password are required'
      });
    }

    // Check if user already exists in the database
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new cashier user into the database
    const newUserResult = await pool.query(
      `INSERT INTO users (username, email, password, name, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, name, role`,
      [username, email, hashedPassword, '-', 'cashier', 'active']
    );
    const newUser = newUserResult.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Cashier registered successfully',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login cashier
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const usrName = req.body.username;
    const userLogin = await pool.query('SELECT * FROM users WHERE username = $1', [usrName]);

    const user = userLogin.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User Not Found'
      });
    }

    if (user.role !== 'cashier') {
      return res.status(400).json({
        success: false,
        message: 'Acces denided!'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          name: user.name,
          avatar: user.avatar
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          language: user.language
        }
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});


// cek email reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'email are required'
      });
    }

    const emailcek = req.body.email;
    const userEmail = await pool.query('SELECT * FROM users WHERE email = $1', [emailcek]);

    const user = userEmail.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email Not Found'
      });
    }

    if (user.role !== 'cashier') {
      return res.status(400).json({
        success: false,
        message: 'Acces denided!'
      });
    }


    // Generate JWT token
    // const token = jwt.sign(
    //   { userId: user.id, username: user.username },
    //   JWT_SECRET,
    //   { expiresIn: '24h' }
    // );

    res.json({
      success: true,
      message: 'Cek your email to reset password !',
      data: {
        user: {
          // id: user.id,
          // username: user.username,
          email: user.email,
          // role: user.role,
          // name: user.name,
          // avatar: user.avatar
        },
        // token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router; 