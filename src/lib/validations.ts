import { z } from 'zod';

// Auth validation schemas
export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(100, { message: 'Password must be less than 100 characters' }),
  fullName: z
    .string()
    .trim()
    .min(1, { message: 'Full name is required' })
    .max(100, { message: 'Full name must be less than 100 characters' }),
  username: z
    .string()
    .trim()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(30, { message: 'Username must be less than 30 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' })
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .max(100, { message: 'Password must be less than 100 characters' })
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be less than 255 characters' })
});

// Project validation schemas
export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  description: z
    .string()
    .trim()
    .max(1000, { message: 'Description must be less than 1000 characters' })
    .optional(),
  genre: z
    .string()
    .trim()
    .max(50, { message: 'Genre must be less than 50 characters' })
    .optional(),
  mood: z
    .string()
    .trim()
    .max(50, { message: 'Mood must be less than 50 characters' })
    .optional(),
  theme: z
    .string()
    .trim()
    .max(100, { message: 'Theme must be less than 100 characters' })
    .optional()
});

// Episode validation schemas
export const episodeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  synopsis: z
    .string()
    .trim()
    .max(1000, { message: 'Synopsis must be less than 1000 characters' })
    .optional(),
  script: z
    .string()
    .trim()
    .max(50000, { message: 'Script must be less than 50000 characters' })
    .optional(),
  episodeNumber: z
    .number()
    .int()
    .positive({ message: 'Episode number must be positive' }),
  season: z
    .number()
    .int()
    .positive({ message: 'Season must be positive' })
    .optional()
});

// Character validation schemas
export const characterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  role: z
    .string()
    .trim()
    .max(100, { message: 'Role must be less than 100 characters' })
    .optional(),
  personality: z
    .string()
    .trim()
    .max(1000, { message: 'Personality must be less than 1000 characters' })
    .optional(),
  background: z
    .string()
    .trim()
    .max(2000, { message: 'Background must be less than 2000 characters' })
    .optional(),
  goals: z
    .string()
    .trim()
    .max(1000, { message: 'Goals must be less than 1000 characters' })
    .optional(),
  age: z
    .number()
    .int()
    .positive({ message: 'Age must be positive' })
    .max(1000, { message: 'Age must be less than 1000' })
    .optional()
});

// Message validation for orchestrator
export const messageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: 'Message cannot be empty' })
    .max(5000, { message: 'Message must be less than 5000 characters' })
});
