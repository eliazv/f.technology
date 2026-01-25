import type { Config } from 'drizzle-kit';

export default {
  schema: './apps/backend/src/database/schema.ts',
  out: './apps/backend/src/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ftechnology',
  },
  verbose: true,
  strict: true,
} satisfies Config;
