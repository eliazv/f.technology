/**
 * Email Service
 * Handles all email sending via Resend
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly appName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured - email sending will be disabled');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'onboarding@resend.dev');
    this.appName = this.configService.get<string>('APP_NAME', 'FTechnology');
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string, userName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.appName} <${this.fromEmail}>`,
        to: email,
        subject: 'Reset della Password',
        html: this.getPasswordResetTemplate(userName, resetLink),
      });

      if (error) {
        this.logger.error(`Failed to send password reset email to ${email}:`, error);
        throw new Error('Impossibile inviare l\'email di reset password');
      }

      this.logger.log(`Password reset email sent to ${email} (ID: ${data?.id})`);
    } catch (error) {
      this.logger.error(`Error sending password reset email:`, error);
      // In development, log the reset link for testing
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(`[DEV] Password reset link for ${email}: ${resetLink}`);
      }
      throw error;
    }
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.appName} <${this.fromEmail}>`,
        to: email,
        subject: `Benvenuto in ${this.appName}!`,
        html: this.getWelcomeTemplate(userName, frontendUrl),
      });

      if (error) {
        this.logger.error(`Failed to send welcome email to ${email}:`, error);
        // Don't throw - welcome email is not critical
        return;
      }

      this.logger.log(`Welcome email sent to ${email} (ID: ${data?.id})`);
    } catch (error) {
      this.logger.error(`Error sending welcome email:`, error);
      // Don't throw - welcome email is not critical
    }
  }

  /**
   * Password reset email template
   */
  private getPasswordResetTemplate(userName: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔐 Reset Password</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #18181b; font-size: 16px; line-height: 24px;">
                Ciao <strong>${userName}</strong>,
              </p>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 22px;">
                Abbiamo ricevuto una richiesta per reimpostare la password del tuo account.
                Clicca sul pulsante qui sotto per procedere:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetLink}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Reimposta Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 24px 0 0; color: #71717a; font-size: 13px; line-height: 20px;">
                Se il pulsante non funziona, copia e incolla questo link nel tuo browser:
              </p>
              <p style="margin: 8px 0 0; padding: 12px; background-color: #f4f4f5; border-radius: 4px; word-break: break-all;">
                <a href="${resetLink}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                  ${resetLink}
                </a>
              </p>

              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; border-left: 4px solid #f59e0b; background-color: #fffbeb; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                      ⚠️ <strong>Importante:</strong> Questo link scadrà tra <strong>1 ora</strong>.
                      Se non hai richiesto questo reset, ignora questa email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                Questa email è stata inviata da <strong>${this.appName}</strong>
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                Se hai domande, contattaci all'indirizzo support@ftechnology.com
              </p>
            </td>
          </tr>
        </table>

        <!-- Security Notice -->
        <p style="margin: 24px 0 0; color: #a1a1aa; font-size: 12px; text-align: center; max-width: 500px;">
          Per la tua sicurezza, non condividere mai questo link con nessuno.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Welcome email template
   */
  private getWelcomeTemplate(userName: string, dashboardUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600;">🎉 Benvenuto!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #18181b; font-size: 18px; line-height: 26px;">
                Ciao <strong>${userName}</strong>,
              </p>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 22px;">
                Benvenuto in <strong>${this.appName}</strong>! Siamo felici di averti con noi.
                Il tuo account è stato creato con successo e sei pronto per iniziare.
              </p>

              <!-- Features List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #18181b; font-size: 15px;">
                      ✅ <strong>Profilo personalizzato</strong> - Gestisci i tuoi dati
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #18181b; font-size: 15px;">
                      🔒 <strong>Sicurezza</strong> - I tuoi dati sono protetti
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #18181b; font-size: 15px;">
                      📊 <strong>Dashboard</strong> - Accesso rapido alle tue info
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${dashboardUrl}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
                      Vai alla Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                Grazie per esserti iscritto a <strong>${this.appName}</strong>
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                Hai bisogno di aiuto? Contattaci: support@ftechnology.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
