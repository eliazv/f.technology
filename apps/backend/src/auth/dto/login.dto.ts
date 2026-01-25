/**
 * Login DTO
 * Validation for login request
 */

import { IsEmail, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Formato email non valido' })
  @IsNotEmpty({ message: "L'email è obbligatoria" })
  email!: string;

  @IsNotEmpty({ message: 'La password è obbligatoria' })
  password!: string;

  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean = false;
}
