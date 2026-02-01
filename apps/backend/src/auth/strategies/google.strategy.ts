/**
 * Google OAuth Strategy
 * Handles authentication via Google OAuth 2.0
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const email = emails[0].value;
    const firstName = name.givenName;
    const lastName = name.familyName;
    const avatarUrl = photos[0]?.value;

    const user = await this.authService.findOrCreateOAuthUser({
      email,
      firstName,
      lastName,
      avatarUrl,
      provider: 'google',
      providerId: id,
    });

    done(null, user);
  }
}
