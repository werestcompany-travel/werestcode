import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

export const registerSchema = z.object({
  name:     z.string().min(1, 'Name is required').max(100),
  email:    z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  phone:    z.string().max(30).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1, 'Token is required').max(256),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const adminLoginSchema = z.object({
  email:    z.string().email().max(255),
  password: z.string().min(1).max(128),
});
