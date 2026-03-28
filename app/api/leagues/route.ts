import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { success, unauthorized, serverError } from '@/lib/helpers/errors';

/**
 * @swagger
 * /api/leagues:
 *   get:
 *     summary: List all available leagues
 *     tags: [Leagues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of leagues
 *   post:
 *     summary: Add a new league to the database
 *     tags: [Leagues]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, series_id]
 *             properties:
 *               name: { type: string }
 *               series_id: { type: string }
 *               league_type: { type: string }
 *     responses:
 *       201:
 *         description: League added
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, error: authError } = await getAuthUser(request);
    if (authError || !supabase) return unauthorized(authError);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active');

    let query = supabase.from('leagues').select('*').order('created_at', { ascending: false });

    if (activeOnly === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) return serverError(error.message);

    return success(data);
  } catch {
    return unauthorized();
  }
}

export async function POST(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthUser(request);
  if (authError || !user || !supabase) return unauthorized(authError);

  try {
    const { name, series_id, league_type } = await request.json();

    if (!name || !series_id) {
      return serverError('Name and Series ID are required');
    }

    // Generate a simple slug/key from the name
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Use Admin client to bypass RLS for global league creation
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('leagues')
      .insert({
        name,
        series_id,
        key,
        league_type: league_type || 'T20',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return serverError(error.message);
    }

    return success(data, 'League added successfully', 201);
  } catch (err) {
    return serverError('Failed to add league');
  }
}
