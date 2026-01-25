/**
 * Push Drizzle schema to PostgreSQL
 * Alternative to drizzle-kit push when connection auth issues occur
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as schema from '../apps/backend/src/database/schema';

async function pushSchema() {
  console.log('📦 Creating schema...');

  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    database: 'ftechnology',
    // No password - using TRUST auth in development
  });

  const db = drizzle(pool, { schema });

  try {
    console.log('🔌 Testing connection...');
    await pool.query('SELECT 1');
    console.log('✅ Connected!');

    // Create tables manually
    console.log('📋 Creating tables...');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        date_of_birth DATE NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS login_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS login_history_user_id_idx ON login_history(user_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS login_history_created_at_idx ON login_history(created_at);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON password_reset_tokens(token);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens(user_id);
    `);

    console.log('✅ Schema created successfully!');
    console.log('\n🎯 Next: Run "npm run db:seed" to populate data');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

pushSchema().catch((error) => {
  console.error(error);
  process.exit(1);
});
