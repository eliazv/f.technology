/**
 * Users Controller
 * Handles user profile HTTP endpoints
 */

import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   * GET /api/users/me
   */
  @Get("me")
  async getProfile(@CurrentUser() user: any) {
    return {
      success: true,
      data: this.usersService.formatUserResponse(user),
    };
  }

  /**
   * Update user profile
   * PATCH /api/users/profile
   */
  @Patch("profile")
  async updateProfile(
    @CurrentUser("id") userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateUserDto,
    );
    return {
      success: true,
      message: "Profilo aggiornato con successo",
      data: this.usersService.formatUserResponse(updatedUser),
    };
  }

  /**
   * Upload user avatar
   * POST /api/users/avatar
   */
  @Post("avatar")
  @UseInterceptors(FileInterceptor("avatar"))
  async uploadAvatar(
    @CurrentUser("id") userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const updatedUser = await this.usersService.updateAvatar(userId, avatarUrl);

    return {
      success: true,
      message: "Avatar caricato con successo",
      data: {
        avatarUrl: updatedUser.avatarUrl,
      },
    };
  }

  /**
   * Remove user avatar
   * DELETE /api/users/avatar
   */
  @Delete("avatar")
  async removeAvatar(@CurrentUser("id") userId: string) {
    const updatedUser = await this.usersService.removeAvatar(userId);

    return {
      success: true,
      message: "Avatar rimosso con successo",
      data: this.usersService.formatUserResponse(updatedUser),
    };
  }

  /**
   * Get login history
   * GET /api/users/login-history
   */
  @Get("login-history")
  async getLoginHistory(
    @CurrentUser("id") userId: string,
    @Query("limit") limit?: number,
  ) {
    const history = await this.usersService.getLoginHistory(userId, limit || 5);

    return {
      success: true,
      data: history.map((entry) => ({
        id: entry.id,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }
}
