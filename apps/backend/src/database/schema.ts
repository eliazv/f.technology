/**
 * Database Schema Definition
 * Defines all tables using Drizzle ORM
 */

import { pgTable, uuid, varchar, text, timestamp, date, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Users table
 * Stores user account information
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash'), // Nullable for OAuth users
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }).notNull(),
    dateOfBirth: date('date_of_birth'), // Nullable for OAuth users
    avatarUrl: text('avatar_url'),
    provider: varchar('provider', { length: 20 }).default('local'), // 'local', 'google', etc.
    providerId: varchar('provider_id', { length: 255 }), // OAuth provider user ID
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    providerIdx: index('users_provider_idx').on(table.provider, table.providerId),
  })
);

/**
 * Login history table
 * Tracks user login attempts
 */
export const loginHistory = pgTable(
  'login_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ipAddress: varchar('ip_address', { length: 45 }).notNull(),
    userAgent: text('user_agent').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('login_history_user_id_idx').on(table.userId),
    createdAtIdx: index('login_history_created_at_idx').on(table.createdAt),
  })
);

/**
 * Password reset tokens table
 * Stores tokens for password recovery
 */
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: index('password_reset_tokens_token_idx').on(table.token),
    userIdIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
  })
);

/**
 * Relations definitions
 */
export const usersRelations = relations(users, ({ many }) => ({
  loginHistory: many(loginHistory),
  passwordResetTokens: many(passwordResetTokens),
}));

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(users, {
    fields: [loginHistory.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type LoginHistoryEntry = typeof loginHistory.$inferSelect;
export type NewLoginHistoryEntry = typeof loginHistory.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
