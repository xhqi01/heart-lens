import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UnauthorizedError } from './auth';
import { NotFoundError, ConfigMissingError } from './errors';

// Maps thrown errors to JSON HTTP responses for route handlers.
export function apiErrorResponse(e: unknown): NextResponse {
  if (e instanceof UnauthorizedError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (e instanceof NotFoundError) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
  if (e instanceof ConfigMissingError) {
    return NextResponse.json({ error: e.message }, { status: 412 });
  }
  if (e instanceof ZodError) {
    return NextResponse.json({ error: 'Invalid input', details: e.flatten() }, { status: 400 });
  }
  const message = e instanceof Error ? e.message : 'Internal error';
  return NextResponse.json({ error: message }, { status: 400 });
}
