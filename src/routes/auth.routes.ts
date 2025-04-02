import { Router } from 'express';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth.types';
import supabase from '../config/supabase';
import logger from '../utils/logger';
import path from 'path';

const router = Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName }: RegisterRequest = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      } as AuthResponse);
    }

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (error) {
      logger.error('Registration error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      } as AuthResponse);
    }

    logger.info('User registered successfully:', email);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: data.user }
    } as AuthResponse);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse);
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      } as AuthResponse);
    }

    // Login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.error('Login error:', error);
      return res.status(401).json({
        success: false,
        message: error.message
      } as AuthResponse);
    }

    logger.info('User logged in successfully:', email);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: data.user,
        session: data.session
      }
    } as AuthResponse);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse);
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Logout error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      } as AuthResponse);
    }

    logger.info('User logged out successfully');
    res.json({
      success: true,
      message: 'Logout successful'
    } as AuthResponse);
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse);
  }
});

// Get current user route
router.get('/me', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      logger.error('Get user error:', error);
      return res.status(401).json({
        success: false,
        message: error.message
      } as AuthResponse);
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    } as AuthResponse);
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as AuthResponse);
  }
});

// Email confirmation route
router.get('/confirm', async (req, res) => {
  try {
    logger.info('Email confirmation page requested');
    
    // Send HTML directly
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Confirmed - Success!</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              }

              body {
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  padding: 20px;
              }

              .container {
                  background: white;
                  padding: 40px;
                  border-radius: 20px;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                  text-align: center;
                  max-width: 500px;
                  width: 100%;
              }

              .success-icon {
                  width: 80px;
                  height: 80px;
                  background: #4CAF50;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 30px;
                  position: relative;
              }

              .success-icon::before {
                  content: '✓';
                  color: white;
                  font-size: 40px;
                  font-weight: bold;
              }

              h1 {
                  color: #333;
                  margin-bottom: 20px;
                  font-size: 28px;
              }

              p {
                  color: #666;
                  margin-bottom: 30px;
                  line-height: 1.6;
              }

              .button {
                  display: inline-block;
                  padding: 12px 30px;
                  background: #4CAF50;
                  color: white;
                  text-decoration: none;
                  border-radius: 25px;
                  font-weight: 500;
                  transition: transform 0.2s, box-shadow 0.2s;
              }

              .button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="success-icon"></div>
              <h1>Email Confirmed!</h1>
              <p>Your email has been successfully verified. You can now close this window and return to the application.</p>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    logger.error('Email confirmation error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Error</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              }

              body {
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%);
                  padding: 20px;
              }

              .container {
                  background: white;
                  padding: 40px;
                  border-radius: 20px;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                  text-align: center;
                  max-width: 500px;
                  width: 100%;
              }

              h1 {
                  color: #333;
                  margin-bottom: 20px;
                  font-size: 28px;
              }

              p {
                  color: #666;
                  margin-bottom: 30px;
                  line-height: 1.6;
              }

              .button {
                  display: inline-block;
                  padding: 12px 30px;
                  background: #ee5253;
                  color: white;
                  text-decoration: none;
                  border-radius: 25px;
                  font-weight: 500;
                  transition: transform 0.2s, box-shadow 0.2s;
              }

              .button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 5px 15px rgba(238, 82, 83, 0.3);
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Verification Error</h1>
              <p>Something went wrong while confirming your email. Please try again or contact support if the problem persists.</p>
          </div>
      </body>
      </html>
    `);
  }
});

export default router; 