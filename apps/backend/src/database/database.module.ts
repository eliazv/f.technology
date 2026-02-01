/**
 * Database Module
 * Configures Drizzle ORM connection to PostgreSQL
 */

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');

        let pool: Pool;

        if (connectionString) {
          pool = new Pool({ connectionString });
        } else {
          pool = new Pool({
            host: configService.get<string>('DATABASE_HOST', 'localhost'),
            port: parseInt(configService.get<string>('DATABASE_PORT', '5433'), 10),
            user: configService.get<string>('DATABASE_USER', 'postgres'),
            password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
            database: configService.get<string>('DATABASE_NAME', 'ftechnology'),
          });
        }

        // Test connection
        try {
          await pool.query('SELECT 1');
        } catch (error) {
          console.error('Database connection failed:', error);
          throw error;
        }

        return drizzle(pool, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}

// Type for the database instance
export type Database = NodePgDatabase<typeof schema>;
