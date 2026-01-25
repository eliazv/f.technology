/**
 * Database Module
 * Configures Drizzle ORM connection to PostgreSQL
 */

import { Module, Global } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async () => {
        const pool = new Pool({
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: 'postgres',
          database: 'ftechnology',
        });

        // Test connection
        try {
          await pool.query('SELECT 1');
          console.log('✅ Database PostgreSQL connected successfully');
        } catch (error) {
          console.error('❌ Database connection failed:', error);
          throw error;
        }

        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}

// Type for the database instance
export type Database = NodePgDatabase<typeof schema>;
