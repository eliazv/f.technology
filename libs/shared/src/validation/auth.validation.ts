import { z } from "zod";

/**
 * Password validation regex:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one number
 */
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, "L'email è obbligatoria")
  .email("Formato email non valido");

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, "La password deve contenere almeno 8 caratteri")
  .regex(
    passwordRegex,
    "La password deve contenere almeno una lettera maiuscola e un numero",
  );

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La password è obbligatoria"),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Il nome deve contenere almeno 2 caratteri")
      .max(50, "Il nome non può superare i 50 caratteri"),
    lastName: z
      .string()
      .min(2, "Il cognome deve contenere almeno 2 caratteri")
      .max(50, "Il cognome non può superare i 50 caratteri"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Conferma la password"),
    dateOfBirth: z
      .string()
      .min(1, "La data di nascita è obbligatoria")
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      }, "Devi avere almeno 13 anni"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token non valido"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Conferma la password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La password attuale è obbligatoria"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Conferma la nuova password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

// Type exports from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
