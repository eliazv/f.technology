/**
 * Database Seed Script
 * Populates the database with initial test data
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as schema from './schema';
import { users, loginHistory } from './schema';

async function seed() {
  console.log('🌱 Starting database seed...');

  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    database: 'ftechnology',
    // No password - using TRUST auth in development
  });

  const db = drizzle(pool, { schema });

  try {
    // Create test user
    const passwordHash = await bcrypt.hash('Password123', 12);

    const [testUser] = await db
      .insert(users)
      .values({
        email: 'test@example.com',
        passwordHash,
        firstName: 'Mario',
        lastName: 'Rossi',
        dateOfBirth: '1990-05-15',
      })
      .onConflictDoNothing()
      .returning();

    if (testUser) {
      console.log('✅ Test user created:', testUser.email);

      // Create some login history
      await db.insert(loginHistory).values([
        {
          userId: testUser.id,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        },
        {
          userId: testUser.id,
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
        },
        {
          userId: testUser.id,
          ipAddress: '192.168.1.3',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Firefox/121.0',
        },
      ]);

      console.log('✅ Login history entries created');
    } else {
      console.log('ℹ️ Test user already exists');
    }

    console.log('🎉 Database seed completed successfully!');
    console.log('\n📧 Test credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: Password123');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
