/**
 * Update User DTO
 * Validation for profile update request
 */

import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsDateString,
} from "class-validator";

export class UpdateUserDto {
  @IsString({ message: "Il nome deve essere una stringa" })
  @IsOptional()
  @MinLength(2, { message: "Il nome deve contenere almeno 2 caratteri" })
  @MaxLength(50, { message: "Il nome non può superare i 50 caratteri" })
  firstName?: string;

  @IsString({ message: "Il cognome deve essere una stringa" })
  @IsOptional()
  @MinLength(2, { message: "Il cognome deve contenere almeno 2 caratteri" })
  @MaxLength(50, { message: "Il cognome non può superare i 50 caratteri" })
  lastName?: string;

  @IsDateString({}, { message: "Formato data non valido" })
  @IsOptional()
  dateOfBirth?: string;
}
