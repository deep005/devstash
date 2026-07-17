import { z } from "zod";

export const signInSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    email: z.email().transform((value) => value.toLowerCase()),
    // bcrypt only uses the first 72 bytes of the password.
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
