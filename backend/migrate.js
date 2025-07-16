import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config(); 

const isProduction = process.env.NODE_ENV === 'production';

let connectionConfig;
if (isProduction) {
  // Use DATABASE_URL for production (Render provides this)
  if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set!');
      process.exit(1); // Exit if critical variable is missing
  }
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render's database
  };
} else {
  // Use individual variables for local development
   if (!process.env.PG_USER || !process.env.PG_HOST || !process.env.PG_DATABASE || !process.env.PG_PASSWORD || !process.env.PG_PORT) {
      console.warn('Local PG environment variables are not fully set. Migration might fail locally.');
      // You might still try connecting, but it's better to warn.
   }
  connectionConfig = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  };
}

// Create database pool
const db = new pg.Pool(connectionConfig);

const runMigrations = async () => {
  let client;
  try {
    console.log('Connecting to the database for migrations...');
    client = await db.connect(); // Get a client from the pool
    console.log('Database connection established.');

    // --- CREATE TABLES ---
    // Use IF NOT EXISTS to make the script idempotent for table creation
    await client.query(`
      -- Create Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        google_id VARCHAR(255),
        verification_code VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active'
        reset_password_token VARCHAR(255),
        reset_password_expires BIGINT
      );

      -- Create Notes table
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        category VARCHAR(255) DEFAULT 'Uncategorized', -- ADDED category column definition
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE -- ADDED ON DELETE CASCADE
      );

      -- Create Session table for express-session
      -- Store sessions securely
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );

      -- Create index for session table (improves lookup performance)
      CREATE UNIQUE INDEX IF NOT EXISTS IDX_SESSION_SID ON session (sid);
    `);
    
    console.log('Users table created successfully (or already existed).');
    console.log('Notes table created successfully (or already existed).');
    console.log('Session table created successfully (or already existed).');
    console.log('Session index created successfully (or already existed).');
    
    // --- ALTER TABLES (ensure columns exist) ---
    // Add the category column if it doesn't exist in the *existing* notes table
    // This handles cases where the table was created by an older migrate script version
    console.log('Ensuring category column exists in notes table...');
    await client.query(`
      ALTER TABLE notes 
      ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'Uncategorized';
    `);
    console.log('Category column migration complete.');
    console.log('All migrations completed successfully!');

    // --- Add other ALTER TABLE or data seed statements here as your schema evolves ---
    // Example: Add an index to user_id on notes table if needed for performance
    // await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes (user_id);`);

  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1); // Exit with error code
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
      console.log('Database client released.');
    }
    // Close the pool
    await db.end();
    console.log('Database connection closed.');
    process.exit(0); // Exit successfully
  }
};

runMigrations(); // Execute