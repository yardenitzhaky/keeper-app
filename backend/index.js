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
import dotenv from 'dotenv';
dotenv.config();



const app = express();
const port = 3000;


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "keeperdb",
  password: "123456",
  port: 5432,
});
db.connect();

app.use(cors({
  origin: true, // Replace with your frontend URL if different
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


const PgSession = pgSession(session);

app.use(
  session({
    store: new PgSession({
      pool: db,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none", // Allows cross-origin cookies
      secure: false,    // Set to true if using HTTPS
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());


passport.use("local", 
  new LocalStrategy(async (username, password, done) => {
    try {
      const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      const user = result.rows[0];

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback",
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
        'INSERT INTO users (google_id, username, password) VALUES ($1, $2, $3) RETURNING *',
        [profile.id, profile.displayName, profile.id]
      );
      user = insertResult.rows[0];
    }

    return done(null, user);  // Continue with the user object
  } catch (err) {
    return done(err, null);
  }
}
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});


// Initiate Google OAuth login
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Log the authenticated user via Google
    console.log("Google login successful for user:", req.user);

    // Manually log the user in to ensure the session is persisted
    req.logIn(req.user, (err) => {
      if (err) {
        console.error('Error logging in the user after Google authentication:', err);
        return res.redirect('/login');
      }
      
      // Successful login, redirect to the frontend
      return res.redirect('http://localhost:5000');
    });
  }
);




app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Registration error', err);
    res.status(500).send('Server error');
  }
});

app.post('/login', (req, res, next) => {
  console.log("Login request received for user:", req.body.username);
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ message: 'Server error', error: err });
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.status(400).json({ message: info.message || 'Login failed' });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: 'Login failed', error: err });
      }

      // Adjust session expiration based on "remember me"
      if (req.body.rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.expires = null; // Session ends when the browser is closed
      }

      console.log("User logged in successfully:", user.username);
      return res.status(200).json({ message: 'Logged in successfully', user });
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
  if (!req.isAuthenticated()) {
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



// Endpoint to add a new note (example of handling POST requests)
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

// Endpoint to edit a note by ID
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

app.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
