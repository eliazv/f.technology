/**
 * Users Service
 * Handles user CRUD operations
 */

import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { eq, desc } from "drizzle-orm";

import { DATABASE_CONNECTION, Database } from "../database/database.module";
import { users, loginHistory } from "../database/schema";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException("Utente non trovato");
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        ...updateUserDto,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException("Utente non trovato");
    }

    return updatedUser;
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string) {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException("Utente non trovato");
    }

    return updatedUser;
  }

  /**
   * Remove user avatar
   */
  async removeAvatar(userId: string) {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        avatarUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException("Utente non trovato");
    }

    return updatedUser;
  }

  /**
   * Get user's login history
   */
  async getLoginHistory(userId: string, limit: number = 5) {
    const history = await this.db.query.loginHistory.findMany({
      where: eq(loginHistory.userId, userId),
      orderBy: [desc(loginHistory.createdAt)],
      limit,
    });

    return history;
  }

  /**
   * Format user for response (exclude sensitive data)
   */
  formatUserResponse(user: typeof users.$inferSelect) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
