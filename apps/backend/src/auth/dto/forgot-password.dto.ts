/**
 * Forgot Password DTO
 */

import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Formato email non valido' })
  @IsNotEmpty({ message: "L'email è obbligatoria" })
  email!: string;
}
