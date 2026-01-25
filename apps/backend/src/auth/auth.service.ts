/**
 * Authentication Service
 * Handles login, registration, and token management
 */

import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { DATABASE_CONNECTION, Database } from '../database/database.module';
import { users, loginHistory } from '../database/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
    private readonly jwtService: JwtService
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
        dateOfBirth: user.dateOfBirth,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accessToken,
      expiresIn: expiresInSeconds * 1000, // Convert to milliseconds
    };
  }
}
