
// Core Express and middleware imports
import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Database and session management
import pg from "pg";
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import passport from 'passport';

// Authentication strategies
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth2';
import bcrypt from 'bcrypt';

// Utility imports
import validator from 'validator';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Initialize Express application
const app = express();

import { spawn } from 'child_process';
import fetch from 'node-fetch';

const FLASK_SERVICE_URL = 'https://keeper-model.onrender.com';

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
    console.log('Loading development environment');
    dotenv.config();
}

// Environment constants
const port = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

const corsOptions = {
    // Specify allowed origin for cross-origin requests
    origin: 'https://yardenitzhaky.github.io',
    credentials: true,
    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Allowed headers in requests
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Set custom headers for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

// Construct database connection string
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;

// Create database pool
const db = new pg.Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }  // Required for Heroku/render.com
});
// Establish database connection
db.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Error connecting to the database:', err));

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Body parsing middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust first proxy in production
app.set('trust proxy', 1);

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

const PgSession = pgSession(session);

// Configure session middleware
app.use(
    session({
        // Store sessions in PostgreSQL
        store: new PgSession({
            pool: db,
            tableName: 'session',
        }),
        // Session configuration
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        // Cookie settings
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            secure: isProduction,              // Secure in production
            httpOnly: true,                    // Prevent XSS
            sameSite: 'none',                 // Required for cross-site cookies
            domain: process.env.NODE_ENV === 'production' 
                ? 'keeper-backend-kgj9.onrender.com' 
                : 'localhost',
        },
        name: 'keeper.sid',  // Custom session cookie name
    })
);

// ============================================================================
// PASSPORT AUTHENTICATION SETUP
// ============================================================================

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// ============================================================================
// DEBUGGING MIDDLEWARE
// ============================================================================

// Log request details for debugging
app.use((req, res, next) => {
    console.log(`Request to ${req.path} - Session ID: ${req.sessionID}`);
    console.log('Session:', JSON.stringify(req.session, null, 2));
    console.log('User:', req.user ? JSON.stringify(req.user, null, 2) : 'No user');
    console.log('Is Authenticated:', req.isAuthenticated());
    next();
});

// Export necessary objects for use in other files
export { app, db };

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

/**
 * Configure NodeMailer transporter for sending emails
 * Uses Gmail SMTP server with environment variables for credentials
 */
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  },
});

// Verify email transport configuration
transporter.verify((error, success) => {
  if (error) {
      console.error('Error configuring Nodemailer transporter:', error);
  } else {
      console.log('Nodemailer transporter is ready to send emails');
  }
});

// ============================================================================
// PASSPORT AUTHENTICATION STRATEGIES
// ============================================================================

/**
* Local Authentication Strategy
* Allows users to login with either username or email
*/
passport.use("local", new LocalStrategy({
  usernameField: 'identifier',    // Field name for username/email
  passwordField: 'password',      // Field name for password
},
async (identifier, password, done) => {
  try {
      // Convert identifier to lowercase for case-insensitive comparison
      const lowercaseIdentifier = identifier.toLowerCase();

      // Query database for user with matching username or email
      const result = await db.query(
          'SELECT * FROM users WHERE (LOWER(username) = $1 OR LOWER(email) = $1) AND status = $2',
          [lowercaseIdentifier, 'active']
      );
      const user = result.rows[0];

      // Handle case when no user is found
      if (!user) {
          console.log('No user found with identifier:', identifier);
          return done(null, false, { message: 'Incorrect username or email.' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          console.log('Password mismatch for user:', identifier);
          return done(null, false, { message: 'Incorrect password.' });
      }

      console.log('User authenticated successfully:', user.id);
      return done(null, user);
  } catch (err) {
      console.error('Error in LocalStrategy:', err);
      return done(err);
  }
}));

/**
* Google OAuth2 Authentication Strategy
* Handles user authentication through Google
*/
passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  passReqToCallback: true
},
async (request, accessToken, refreshToken, profile, done) => {
  try {
      console.log('Google profile:', profile);

      // Extract email from Google profile
      const userEmail = profile.email || profile.emails[0].value;
      
      // Check if user exists by Google ID
      const result = await db.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
      let user = result.rows[0];

      if (!user) {
          // Check if user exists with the email
          const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [userEmail]);
          
          if (emailCheck.rows.length > 0) {
              // Link existing account with Google
              const updateResult = await db.query(
                  'UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *',
                  [profile.id, userEmail]
              );
              user = updateResult.rows[0];
          } else {
              // Create new user with Google profile
              const insertResult = await db.query(
                  'INSERT INTO users (google_id, username, password, email, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                  [
                      profile.id,
                      profile.displayName,
                      profile.id,  // Using Google ID as password
                      userEmail,
                      "active"
                  ]
              );
              user = insertResult.rows[0];
          }
      } else if (user.status !== 'active') {
          // Activate user if needed
          const updateResult = await db.query(
              'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
              ['active', user.id]
          );
          user = updateResult.rows[0];
      }

      console.log('Authenticated user:', user);
      return done(null, user);
  } catch (err) {
      console.error('Google authentication error:', err);
      return done(err, null);
  }
}));

// ============================================================================
// PASSPORT SESSION SERIALIZATION
// ============================================================================

/**
* Serialize user object to store in session
* Only stores user ID in the session
*/
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

/**
* Deserialize user from session
* Retrieves full user object from database using stored ID
*/
passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user with id:', id);
  try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) {
          console.log('No user found with id:', id);
          return done(null, false);
      }
      console.log('Deserialized user:', result.rows[0]);
      done(null, result.rows[0]);
  } catch (err) {
      console.error('Error in deserializeUser:', err);
      done(err);
  }
});

//POST ROUTES.

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Server-side validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Validate email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  // Check if the password is strong
  const isStrongPassword = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrongPassword) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
    });
  }

  try {

    const lowercaseUsername = username.toLowerCase();
    const lowercaseEmail = email.toLowerCase();

    // First check username
    const usernameCheck = await db.query(
      'SELECT * FROM users WHERE LOWER(username) = $1',
      [lowercaseUsername]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(409).json({
        field: 'username',
        message: 'This username is already taken. Please choose a different one.'
      });
    }

      // Then check email
      const emailCheck = await db.query(
        'SELECT * FROM users WHERE LOWER(email) = $1',
        [lowercaseEmail]
      );
  
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          field: 'email',
          message: 'An account with this email already exists.'
        });
      }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const result = await db.query(
      'INSERT INTO users (username, email, password, verification_code, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, email, hashedPassword, verificationCode, 'pending']
    );
    const user = result.rows[0];

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Email Verification',
      text: `Hello ${username},

Thank you for registering on our app. Please verify your email address by entering the following verification code in the app:

Verification Code: ${verificationCode}

If you did not request this, please ignore this email.

Best regards,
Your App Team`,
    };

    await transporter.sendMail(mailOptions);


    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (err) {
    console.error('Registration error', err);
    res.status(500).send('Server error');
  }
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('Received forgot password request for email:', email);


  try {
    // Check if the user exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.log('No user found with email:', email);
      // For security, we return the same response whether the email exists or not
      return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    }
    console.log('User found, generating reset token');

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // Token expires in 1 hour

    // Update user with reset token and expiration
    await db.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [token, expires, email]
    );

    // Send reset email
    const resetUrl = `https://yardenitzhaky.github.io/keeper-app/reset-password/${token}`;

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `You are receiving this email because a password reset request was made for your account.\n\n
Please click on the following link, or paste it into your browser, to complete the process within one hour:\n\n
${resetUrl}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log('Received reset password request for token:', token);

  try {
    // Find the user with the matching reset token and check if it's not expired
    const result = await db.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2',
      [token, Date.now()]
    );
    const user = result.rows[0];

    if (!user) {
      console.log('No user found with the provided token or token expired');
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }
  
    console.log('User found, validating new password');
    // Validate the new password (reuse your password validation logic)
    const isStrongPassword = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (!isStrongPassword) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      });
    }

    // Hash the new password
    console.log('Hashing new password');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and remove reset token fields
    console.log('Updating user password and clearing reset token');
    await db.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    console.log('Password reset successful');
    res.status(200).json({ message: 'Your password has been updated successfully.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

app.post('/login', (req, res, next) => {
  console.log("Login request received for user:", req.body.identifier);
  const { identifier, password, rememberMe } = req.body;
  
  if (!identifier || !password) {
    console.log("Missing credentials", req.body);
    return res.status(400).json({ message: 'Missing credentials' });
  }
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ message: 'Server error', error: err });
    }
    
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.status(400).json({ message: info.message || 'Login failed' });
    }
    
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error("Login error:", loginErr);
        return res.status(500).json({ message: 'Login failed', error: loginErr });
      }
      
      // Adjust session expiration based on "remember me"
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.expires = false; // Session ends when the browser is closed
      }
      
      console.log("User logged in successfully:", user.username);
      console.log("Session ID:", req.sessionID);
      console.log("Session:", JSON.stringify(req.session, null, 2));
      
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
          return res.status(500).json({ message: 'Session save failed', error: saveErr });
        }
        
        return res.status(200).json({
          message: 'Logged in successfully',
          user: { id: user.id, username: user.username, email: user.email }
        });
      });
    });
  })(req, res, next);
});

  app.post('/logout', (req, res) => {
    req.logout(err => {
      if (err) {
        return res.status(500).send('Logout failed');
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

app.post('/verify-email', async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Find the user with the provided email and verification code
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND verification_code = $2',
      [email, verificationCode]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    // Update the user's status to 'active' and clear the verification code
    await db.query(
      'UPDATE users SET status = $1, verification_code = NULL WHERE id = $2',
      ['active', user.id]
    );

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('Email verification error', err);
    res.status(500).send('Server error');
  }
});

app.post('/add', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { title, content, category } = req.body;

  try {

    const fullText = `${title} ${content}`; // Combine title and content
    const noteCategory = category || await classifyText(fullText);
    console.log('Classified category:', noteCategory);

    const result = await db.query(
      'INSERT INTO notes (title, content, category, user_id) VALUES ($1, $2, $3, $4) RETURNING *;',
      [title, content, noteCategory, req.user.id]
    );
    console.log('Note added:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/classify-text', async (req, res) => {
  const { title, content } = req.body;
  
  // Better validation - check both title and content
  if (!title && !content) {
    return res.status(400).json({ 
      success: false,
      error: 'No text provided', 
      category: 'Uncategorized' 
    });
  }
  
  try {
    // Combine title and content, handling nulls
    const fullText = `${title || ''} ${content || ''}`.trim();
    
    // Add timeout to fetch to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
    
    // Call the Flask service with timeout
    const response = await fetch("https://keeper-model.onrender.com/classify", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: fullText }),
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Flask service returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Validate response structure
    if (!result || typeof result.category !== 'string') {
      throw new Error('Invalid response from classification service');
    }
    
    res.json({
      category: result.category,
      success: true
    });
  } catch (error) {
    console.error('Classification error:', error);
    
    // Handle specific error types
    let errorMessage = 'Classification failed, using default category';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Classification service timed out';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = 'Classification service unavailable';
    }
    
    // Always return a valid response, even on error
    res.json({
      category: 'Uncategorized',
      success: false,
      error: errorMessage
    });
  }
});

//GET ROUTES


// Get all categories
app.get('/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Database error', err);
    res.status(500).send('Server error');
  }
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log("Google login successful for user:", req.user);
    req.login(req.user, (err) => {
      if (err) {
        console.error("Error logging in the user after Google authentication:", err);
        return res.redirect('https://yardenitzhaky.github.io/keeper-app/login?error=auth_failed');
      }
      req.session.save(() => {
        res.redirect(isProduction ? 'https://yardenitzhaky.github.io/keeper-app/' : 'http://localhost:5173');
      })
    });
  }
);

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM notes;");
    res.json(result.rows);
  } catch (err) {
    console.error("Database error", err);
    res.status(500).send("Server error");
  }
});

app.get('/notes', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    console.log("details", req.isAuthenticated(), req.user);
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const result = await db.query('SELECT * FROM notes WHERE user_id = $1;', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error', err);
    res.status(500).send('Server error');
  }
});

app.get('/me', (req, res) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Is Authenticated:', req.isAuthenticated());
  if (req.isAuthenticated()) {
    const { id, username, email } = req.user;
    res.json({ user: { id, username, email } });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.get('/check-session', (req, res) => {
  console.log('Session check - Session:', req.session);
  console.log('Session check - User:', req.user);
  console.log('Session check - Is Authenticated:', req.isAuthenticated());
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.user
  });
});


app.delete("/notes/:id", async (req, res) => {
  const noteId = req.params.id;

  try {
    await db.query("DELETE FROM notes WHERE id = $1;", [noteId]);
    res.status(200).send(`Note with ID ${noteId} was deleted.`);
  } catch (err) {
    console.error("Database error", err);
    res.status(500).send("Server error");
  }
});


app.put("/notes/:id", async (req, res) => {
  const noteId = req.params.id;
  const { title, content } = req.body;
  console.log("Updating note with ID:", noteId);

  if (!title || !content) {
    console.log("Title and content are required", title, content);
    return res.status(400).json({ message: "Title and content are required" });
  }
  try {
    const result = await db.query(
      "UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *;",
      [title, content, noteId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Note not found or you don't have permission to update it" });
    }
    console.log("Note updated:", result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Database error", err);
    res.status(500).send("Server error");
  }
});

app.put('/notes/:id/category', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

  const { id } = req.params;
  const { category } = req.body;

  try {
    const result = await db.query(
      'UPDATE notes SET category = $1 WHERE id = $2 AND user_id = $3 RETURNING *;',
      [category, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

async function classifyText(text) {
  try {
    const response = await fetch(`${FLASK_SERVICE_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Classification service returned ${response.status}`);
    }

    const result = await response.json();
    return result.category;
  } catch (error) {
    console.error('Classification error:', error);
    return 'Uncategorized';
  }
}
