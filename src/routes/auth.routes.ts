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
    const { access_token, refresh_token } = req.query;

    if (!access_token || !refresh_token) {
      logger.error('Missing tokens in confirmation request');
      return res.status(400).sendFile(path.join(__dirname, '../views/error.html'));
    }

    // Set the session with the tokens
    const { data, error } = await supabase.auth.setSession({
      access_token: access_token as string,
      refresh_token: refresh_token as string,
    });

    if (error) {
      logger.error('Session error:', error);
      return res.status(400).sendFile(path.join(__dirname, '../views/error.html'));
    }

    logger.info('Email confirmed and session established successfully');
    res.sendFile(path.join(__dirname, '../views/success.html'));
  } catch (error) {
    logger.error('Email confirmation error:', error);
    res.status(500).sendFile(path.join(__dirname, '../views/error.html'));
  }
});

export default router; 