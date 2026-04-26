import { z } from 'zod';

export const studentCreateSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, 'PRN is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    department: z.string().optional(),
    year: z.number().optional().or(z.string().regex(/^\d+$/).transform(Number)),
    phone: z.string().optional(),
    address: z.string().optional(),
    fees: z.object({
      total: z.number().min(0),
      paid: z.number().min(0).optional(),
      pending: z.number().min(0).optional(),
      paymentHistory: z.array(z.any()).optional()
    }).optional(),
    scholarship: z.object({
      eligible: z.boolean().optional(),
      applied: z.boolean().optional(),
      status: z.string().optional(),
      amount: z.number().optional()
    }).optional(),
  }).passthrough()
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['admin', 'student']).optional(),
  })
});
