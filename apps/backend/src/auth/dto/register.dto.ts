/**
 * Register DTO
 * Validation for registration request
 */

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Il nome deve essere una stringa' })
  @IsNotEmpty({ message: 'Il nome è obbligatorio' })
  @MinLength(2, { message: 'Il nome deve contenere almeno 2 caratteri' })
  @MaxLength(50, { message: 'Il nome non può superare i 50 caratteri' })
  firstName!: string;

  @IsString({ message: 'Il cognome deve essere una stringa' })
  @IsNotEmpty({ message: 'Il cognome è obbligatorio' })
  @MinLength(2, { message: 'Il cognome deve contenere almeno 2 caratteri' })
  @MaxLength(50, { message: 'Il cognome non può superare i 50 caratteri' })
  lastName!: string;

  @IsEmail({}, { message: 'Formato email non valido' })
  @IsNotEmpty({ message: "L'email è obbligatoria" })
  email!: string;

  @IsString({ message: 'La password deve essere una stringa' })
  @IsNotEmpty({ message: 'La password è obbligatoria' })
  @MinLength(8, { message: 'La password deve contenere almeno 8 caratteri' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La password deve contenere almeno una lettera maiuscola e un numero',
  })
  password!: string;

  @IsDateString({}, { message: 'Formato data non valido' })
  @IsNotEmpty({ message: 'La data di nascita è obbligatoria' })
  dateOfBirth!: string;
}
