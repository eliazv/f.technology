/**
 * Authentication Service
 * Handles login, registration, and token management
 */

import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';

import { DATABASE_CONNECTION, Database } from '../database/database.module';
import { users, loginHistory, passwordResetTokens } from '../database/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';

/**
 * Authentication response structure
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, registerDto.email.toLowerCase()),
    });

    if (existingUser) {
      throw new ConflictException('Email già registrata');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const [newUser] = await this.db
      .insert(users)
      .values({
        email: registerDto.email.toLowerCase(),
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        dateOfBirth: registerDto.dateOfBirth,
      })
      .returning();

    // Send welcome email (non-blocking)
    this.emailService
      .sendWelcomeEmail(newUser.email, `${newUser.firstName} ${newUser.lastName}`)
      .catch((error) => console.error('Failed to send welcome email:', error));

    return this.generateAuthResponse(newUser);
  }

  /**
   * Login user with credentials
   */
  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Record login history
    await this.db.insert(loginHistory).values({
      userId: user.id,
      ipAddress,
      userAgent,
    });

    const expiresIn = loginDto.rememberMe
      ? 30 * 24 * 60 * 60 // 30 days
      : 7 * 24 * 60 * 60; // 7 days

    return this.generateAuthResponse(user, expiresIn);
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    return user;
  }

  /**
   * Validate user by ID (for JWT strategy)
   */
  async validateUserById(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new UnauthorizedException('Utente non trovato');
    }

    return user;
  }

  /**
   * Find or create OAuth user
   */
  async findOrCreateOAuthUser(oauthData: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    provider: string;
    providerId: string;
  }) {
    // Try to find existing user by provider and providerId
    let user = await this.db.query.users.findFirst({
      where: and(
        eq(users.provider, oauthData.provider),
        eq(users.providerId, oauthData.providerId)
      ),
    });

    if (user) {
      // Update avatar if changed
      if (oauthData.avatarUrl && user.avatarUrl !== oauthData.avatarUrl) {
        await this.db
          .update(users)
          .set({ avatarUrl: oauthData.avatarUrl, updatedAt: new Date() })
          .where(eq(users.id, user.id));
        user.avatarUrl = oauthData.avatarUrl;
      }
      return user;
    }

    // Try to find by email (user might have registered with email/password)
    user = await this.db.query.users.findFirst({
      where: eq(users.email, oauthData.email.toLowerCase()),
    });

    if (user) {
      // Link OAuth provider to existing account
      await this.db
        .update(users)
        .set({
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          avatarUrl: oauthData.avatarUrl || user.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return {
        ...user,
        provider: oauthData.provider,
        providerId: oauthData.providerId,
        avatarUrl: oauthData.avatarUrl || user.avatarUrl,
      };
    }

    // Create new user
    const [newUser] = await this.db
      .insert(users)
      .values({
        email: oauthData.email.toLowerCase(),
        firstName: oauthData.firstName,
        lastName: oauthData.lastName,
        avatarUrl: oauthData.avatarUrl,
        provider: oauthData.provider,
        providerId: oauthData.providerId,
        passwordHash: null, // OAuth users don't have passwords
        dateOfBirth: null, // Will be set later if needed
      })
      .returning();

    return newUser;
  }

  /**
   * Request password reset
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, forgotPasswordDto.email.toLowerCase()),
    });

    // Don't reveal if email exists for security
    if (!user) {
      return { message: 'Se l\'email esiste, riceverai le istruzioni per il reset della password' };
    }

    // Generate secure random token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Invalidate any existing tokens for this user
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

    // Create new reset token
    await this.db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        token,
        `${user.firstName} ${user.lastName}`
      );
    } catch (error) {
      // Log error but don't reveal it to the user for security
      console.error('Failed to send password reset email:', error);
    }

    return { message: 'Se l\'email esiste, riceverai le istruzioni per il reset della password' };
  }

  /**
   * Reset password using token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password, confirmPassword } = resetPasswordDto;

    // Validate passwords match
    if (password !== confirmPassword) {
      throw new UnauthorizedException('Le password non corrispondono');
    }

    // Find valid token
    const resetToken = await this.db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    });

    if (!resetToken) {
      throw new UnauthorizedException('Token non valido o scaduto');
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException('Token scaduto');
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      throw new UnauthorizedException('Token già utilizzato');
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 12);
    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, resetToken.userId));

    // Mark token as used
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    return { message: 'Password reimpostata con successo' };
  }

  /**
   * Generate authentication response with JWT token
   */
  private generateAuthResponse(
    user: typeof users.$inferSelect,
    expiresInSeconds: number = 7 * 24 * 60 * 60
  ): AuthResponse {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: expiresInSeconds,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth || '',
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accessToken,
      expiresIn: expiresInSeconds * 1000, // Convert to milliseconds
    };
  }
}
