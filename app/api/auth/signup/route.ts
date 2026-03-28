import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { created, badRequest, serverError } from '@/lib/helpers/errors';
import type { SignupRequest } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, full_name, password]
 *             properties:
 *               email:
 *                 type: string
 *               full_name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or email already taken
 */
export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const { email, full_name, password } = body;

    if (!email || !full_name || !password) {
      return badRequest('Email, full_name, and password are required');
    }

    if (password.length < 6) {
      return badRequest('Password must be at least 6 characters');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });

    if (error) {
      return badRequest(error.message);
    }

    return created({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name,
      },
      session: data.session,
    }, 'User registered successfully');
  } catch {
    return serverError('Failed to register user');
  }
}
