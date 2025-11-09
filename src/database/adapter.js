// Database Adapter - Supports SQLite (local) and Cloud DBs (production)
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine which database to use
const DB_TYPE = process.env.DB_TYPE || 'sqlite';
const IS_VERCEL = process.env.VERCEL === '1';

// Database connection singleton
let dbConnection = null;

/**
 * Get database connection
 * Automatically switches between SQLite (local) and cloud DB (production)
 */
export function getDatabase() {
  if (dbConnection) return dbConnection;

  if (IS_VERCEL || DB_TYPE !== 'sqlite') {
    // Cloud database for production
    console.warn('⚠️  Cloud database not yet configured. Using in-memory SQLite for testing.');
    console.warn('   For production, configure POSTGRES_URL or other cloud database.');
    dbConnection = new Database(':memory:');
  } else {
    // SQLite for local development
    const dbPath = join(__dirname, '../../database.db');
    dbConnection = new Database(dbPath);
  }

  return dbConnection;
}

/**
 * Execute query with automatic database adapter
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
export async function query(sql, params = []) {
  const db = getDatabase();

  try {
    // For cloud databases, this would use async queries
    // For SQLite, we use synchronous queries
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute single row query
 */
export async function queryOne(sql, params = []) {
  const db = getDatabase();

  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute insert/update/delete query
 */
export async function execute(sql, params = []) {
  const db = getDatabase();

  try {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (dbConnection) {
    dbConnection.close();
    dbConnection = null;
  }
}

/**
 * Migration helper for Vercel Postgres
 * Uncomment and configure when ready to use Vercel Postgres
 */
/*
import { sql } from '@vercel/postgres';

export async function queryPostgres(query, params = []) {
  try {
    const result = await sql.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Postgres query error:', error);
    throw error;
  }
}
*/

/**
 * Migration helper for Supabase
 * Uncomment and configure when ready to use Supabase
 */
/*
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function querySupabase(table, options = {}) {
  try {
    const { data, error } = await supabase.from(table).select(options.select || '*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
}
*/

export default {
  getDatabase,
  query,
  queryOne,
  execute,
  closeDatabase,
};
