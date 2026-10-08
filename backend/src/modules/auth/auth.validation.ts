import { z } from "zod";

const email = z.email().trim().toLowerCase();

// at least 8 chars with a letter and a number
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/\d/, "Password must contain a number");

const phone = z
  .string()
  .trim()
  .regex(/^\+?\d{10,15}$/, "Invalid phone number");

export const registerNgoSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email,
  phone: phone.optional(),
  password,
  organizationName: z.string().trim().min(2).max(150),
  entityType: z.enum(["TRUST", "SOCIETY", "SECTION8", "RELIGIOUS_TRUST", "OTHER"]).optional(),
  planCode: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
});

export type RegisterNgoInput = z.infer<typeof registerNgoSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
