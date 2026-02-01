/**
 * Authentication Controller
 * Handles authentication-related HTTP endpoints
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
} from "@nestjs/common";
import { Request } from "express";
import { Throttle } from "@nestjs/throttler";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /api/auth/register
   * Rate limit: 3 attempts per 15 minutes
   */
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 requests per 15 minutes
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const result = await this.authService.register(registerDto, ipAddress, userAgent);
    return {
      success: true,
      message: "Registrazione completata con successo",
      data: result,
    };
  }

  /**
   * Login with credentials
   * POST /api/auth/login
   * Rate limit: 5 attempts per 5 minutes
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 requests per 5 minutes
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const result = await this.authService.login(loginDto, ipAddress, userAgent);
    return {
      success: true,
      message: "Login effettuato con successo",
      data: result,
    };
  }

  /**
   * Verify token and get current user
   * GET /api/auth/me
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Logout (client-side token removal)
   * POST /api/auth/logout
   */
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return {
      success: true,
      message: "Logout effettuato con successo",
    };
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   * Rate limit: 3 attempts per 15 minutes
   */
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 requests per 15 minutes
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return {
      success: true,
      message: result.message,
    };
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   * Rate limit: 3 attempts per 15 minutes
   */
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 requests per 15 minutes
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return {
      success: true,
      message: result.message,
    };
  }

  /**
   * Google OAuth login
   * GET /api/auth/google
   */
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  /**
   * Google OAuth callback
   * GET /api/auth/google/callback
   */
  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: any) {
    // User is returned from GoogleStrategy
    const user = req.user;

    // Generate JWT token
    const authResponse = this.authService['generateAuthResponse'](user);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    return {
      success: true,
      message: "Autenticazione Google completata",
      data: authResponse,
      redirectUrl: `${frontendUrl}/auth/callback?token=${authResponse.accessToken}`,
    };
  }
}
