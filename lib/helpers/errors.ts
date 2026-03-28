import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types';

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status: 401 }
  );
}

export function badRequest(message = 'Bad request') {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status: 400 }
  );
}

export function notFound(message = 'Not found') {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status: 404 }
  );
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status: 403 }
  );
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status: 500 }
  );
}

export function success<T>(data: T, message?: string, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, message },
    { status }
  );
}

export function created<T>(data: T, message?: string) {
  return success(data, message, 201);
}
