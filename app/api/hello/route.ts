import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Hello World API
 *     description: Returns a friendly hello world message
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello World!
 */
export async function GET() {
  return NextResponse.json({ message: 'Hello World!' });
}