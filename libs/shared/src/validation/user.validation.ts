import { z } from "zod";

/**
 * Update user profile validation schema
 */
export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "Il nome deve contenere almeno 2 caratteri")
    .max(50, "Il nome non può superare i 50 caratteri")
    .optional(),
  lastName: z
    .string()
    .min(2, "Il cognome deve contenere almeno 2 caratteri")
    .max(50, "Il cognome non può superare i 50 caratteri")
    .optional(),
  dateOfBirth: z
    .string()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 120;
    }, "Devi avere almeno 13 anni")
    .optional(),
});

/**
 * Avatar upload validation
 */
export const avatarSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "L'immagine non può superare i 5MB",
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type,
        ),
      "Formato immagine non supportato. Usa JPG, PNG, GIF o WebP",
    ),
});

// Type exports from schemas
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type AvatarFormData = z.infer<typeof avatarSchema>;
