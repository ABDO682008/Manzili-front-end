import { z } from 'zod';

export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z
  .string()
  .regex(/^01[0-2,5]{1}[0-9]{8}$/, 'Please enter a valid Egyptian phone number (e.g., 01012345678)')
  .optional()
  .or(z.literal(''));

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const serviceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  categoryId: z.number().positive('Please select a category'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().positive('Price must be greater than 0'),
  minPrice: z.number().positive().optional(),
  duration: z.string().optional(),
  autoAccept: z.boolean().optional(),
  status: z.enum(['Active', 'Draft']).optional(),
});

export const discountSchema = z.object({
  code: z.string().min(5, 'Code must be at least 5 characters').max(20, 'Code must be less than 20 characters').regex(/^[a-zA-Z0-9]+$/, 'Code can only contain letters and numbers'),
  type: z.enum(['Percentage', 'FixedAmount']),
  value: z.number().positive('Value must be greater than 0'),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.number().positive().optional(),
  minPurchaseAmount: z.number().positive().optional(),
});

export const paymentProofSchema = z.object({
  method: z.enum(['Instapay', 'VodafoneCash', 'BankTransfer']),
  proofImage: z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB'),
  note: z.string().max(500).optional(),
});

export const repriceSchema = z.object({
  proposedPrice: z.number().positive('Price must be greater than 0'),
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)'),
});

export const rejectSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
