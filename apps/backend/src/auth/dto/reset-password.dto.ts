/**
 * Reset Password DTO
 */

import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Il token è obbligatorio' })
  @IsString()
  token!: string;

  @IsNotEmpty({ message: 'La password è obbligatoria' })
  @MinLength(8, { message: 'La password deve contenere almeno 8 caratteri' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La password deve contenere almeno una lettera maiuscola e un numero',
  })
  password!: string;

  @IsNotEmpty({ message: 'La conferma password è obbligatoria' })
  confirmPassword!: string;
}
