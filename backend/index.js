import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from 'cors';
import bcrypt from 'bcrypt';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import passport from 'passport';
import GoogleStrategy  from 'passport-google-oauth2';
import validator from 'validator';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import exp from "constants";

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'https://keeper-frontend-36zj.onrender.com', // Replace with your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Set custom headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

if (process.env.NODE_ENV !== 'production') {
  console.log('Loading development environment');
  dotenv.config();
}
const port = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === 'production';


const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;
const db = new pg.Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});



db.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Error connecting to the database:', err));

app.use(bodyParser.json());
app.use(express.json());

const allowedOrigins = [
  'https://keeper-frontend-36zj.onrender.com',
  'https://keeper-backend-kgj9.onrender.com',
  'http://localhost:5173',
  'https://localhost:5173'
  // Add any other origins you need, including local development URLs
];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//   "Access-Control-Allow-Credentials": true
// }));


// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Origin', req.headers.origin); // Don't use '*'
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });




const PgSession = pgSession(session);

app.set('trust proxy', 1); // trust first proxy




app.use(
  session({
    store: new PgSession({
      pool: db,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: isProduction,
      httpOnly: true,
      sameSite: 'None',
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : 'localhost',
    },
    name: 'keeper.sid',
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(`Request to ${req.path} - Session ID: ${req.sessionID}`);
  console.log('Session:', JSON.stringify(req.session, null, 2));
  console.log('User:', req.user ? JSON.stringify(req.user, null, 2) : 'No user');
  console.log('Is Authenticated:', req.isAuthenticated());
  next();
});

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or any other email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error configuring Nodemailer transporter:', error);
  } else {
    console.log('Nodemailer transporter is ready to send emails');
  }
});

//Passport Local Strategy

passport.use("local", 
  new LocalStrategy({
    usernameField: 'identifier', 
    passwordField: 'password',
  },
  async (identifier, password, done) => {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE (username = $1 OR email = $1) AND status = $2',
        [identifier, 'active']
      );
      const user = result.rows[0];

      if (!user) {
        console.log('No user found with identifier:', identifier);
        return done(null, false, { message: 'Incorrect username or email.' });
      }

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
  })
);

passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  passReqToCallback: true
},
async (request, accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user already exists in your database
    const result = await db.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
    let user = result.rows[0];

    if (!user) {
      // If user doesn't exist, create a new user in your database
      const insertResult = await db.query(
        'INSERT INTO users (google_id, username, password, email, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [profile.id, profile.displayName, profile.id, "google email", "active"]
      );
      user = insertResult.rows[0];
    } else if (user.status !== 'active') {
      // If the user exists but their status is not active, update it to active
      const updateResult = await db.query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
        ['active', user.id]
      );
      user = updateResult.rows[0];
    }


    return done(null, user);  // Continue with the user object
  } catch (err) {
    return done(err, null);
  }
}
));


passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

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

//POST ROUTES

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
    // Check if the username or email already exists
    const userExists = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [
      username,
      email,
    ]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomBytes(20).toString('hex');
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

  try {
    // Check if the user exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      // For security, we return the same response whether the email exists or not
      return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // Token expires in 1 hour

    // Update user with reset token and expiration
    await db.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [token, expires, email]
    );

    // Send reset email
    const resetUrl = `https://keeper-frontend-36zj.onrender.com/reset-password/${token}`;

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

  try {
    // Find the user with the matching reset token and check if it's not expired
    const result = await db.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2',
      [token, Date.now()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and remove reset token fields
    await db.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

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

  const { title, content } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *;',
      [title, content, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database error', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTES

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log("Google login successful for user:", req.user);
    req.login(req.user, (err) => {
      if (err) {
        console.error("Error logging in the user after Google authentication:", err);
        return res.redirect('https://keeper-frontend-36zj.onrender.com/login?error=auth_failed');
      }
      req.session.save(() => {
        res.redirect(isProduction ? 'https://keeper-frontend-36zj.onrender.com' : 'http://localhost:5173');
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

  try {
    const result = await db.query(
      "UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *;",
      [title, content, noteId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Database error", err);
    res.status(500).send("Server error");
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
